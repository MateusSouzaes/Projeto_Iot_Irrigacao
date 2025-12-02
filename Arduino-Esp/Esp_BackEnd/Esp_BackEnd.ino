/*
 * ==========================================================
 * SISTEMA DE IRRIGAÇÃO – ESP8266 (Cérebro)
 * Funções:
 *   - Buscar dados do Arduino (umidade, chuva, fluxo)
 *   - Buscar previsão do tempo (OpenWeather)
 *   - Decidir irrigação
 *   - Expor API REST para o backend
 * ==========================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <SoftwareSerial.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// -------- CONFIG Wi-Fi --------
const char* ssid = "Irrigar";
const char* password = "vento123";

// -------- OPENWEATHER --------
String apiKey = "b530897f08b4433bc6736eafe8867095";
String lat = "-10.8753";
String lon = "-61.9521";

// Fuso horário Brasil (RO/AM)
const long fusoHorario_UTC_em_Segundos = -14400;

// -------- OBJETOS --------
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", fusoHorario_UTC_em_Segundos);
WiFiClientSecure clientSecure;
ESP8266WebServer server(80);

// COMUNICAÇÃO COM ARDUINO
#define UNO_RX_PIN D2
#define UNO_TX_PIN D3
SoftwareSerial unoSerial(UNO_RX_PIN, UNO_TX_PIN);

// VARIÁVEIS DOS SENSORES
int umidadeArduino = 0;
int chuvaArduino = 0;
int fluxoArduino = 0;

// VARIÁVEIS DO SISTEMA
bool chanceChuvaAlta = false;   // chuva >= 70% nas próximas 8 horas
String statusUltimaAcao = "Aguardando...";

// BUFFER JSON DO UNO
String jsonDoUno = "";

// CONTROLE DA API DE PREVISÃO
unsigned long ultimoCheckTempo = 0;
const long intervaloCheckTempo = 3600000; // 1 hora

// -------- PROTÓTIPOS --------
void receberDadosDoUno();
void tomarDecisaoIrrigacao();
void buscarPrevisaoChuva8h();
void enviarComandoAoUno(String comando);

// ================================
// ---------- SETUP ---------------
// ================================
void setup() {
  Serial.begin(9600);
  unoSerial.begin(9600);

  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" OK!");

  timeClient.begin();
  timeClient.update();

  clientSecure.setInsecure();

  // ROTAS API
  server.on("/status", []() {
    StaticJsonDocument<300> doc;

    doc["umidade"] = umidadeArduino;
    doc["chuva"] = chuvaArduino;
    doc["fluxo"] = fluxoArduino;
    doc["chance_chuva_8h"] = chanceChuvaAlta;
    doc["status"] = statusUltimaAcao;
    doc["ip"] = WiFi.localIP().toString();

    String json;
    serializeJson(doc, json);

    server.send(200, "application/json", json);
  });

  server.begin();
  Serial.println("API Online em: " + WiFi.localIP().toString());

  buscarPrevisaoChuva8h();
}

// ================================
// ----------- LOOP --------------
// ================================
void loop() {
  server.handleClient();
  receberDadosDoUno();

  unsigned long agora = millis();
  if (agora - ultimoCheckTempo >= intervaloCheckTempo) {
    ultimoCheckTempo = agora;
    buscarPrevisaoChuva8h();
  }
}

// ================================
// ---- RECEBE DADOS DO UNO ------
// ================================
void receberDadosDoUno() {
  while (unoSerial.available() > 0) {
    char c = unoSerial.read();

    if (c == '\n') {
      StaticJsonDocument<200> doc;
      auto err = deserializeJson(doc, jsonDoUno);

      if (!err) {
        umidadeArduino = doc["umidade"];
        chuvaArduino   = doc["chuva"];
        fluxoArduino   = doc["fluxo"];

        tomarDecisaoIrrigacao();
      }

      jsonDoUno = "";
    } else {
      jsonDoUno += c;
    }
  }
}

// ================================
// ---- PREVISÃO CHUVA 8h --------
// ================================
void buscarPrevisaoChuva8h() {
  if (WiFi.status() != WL_CONNECTED) return;

  String url =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat +
    "&lon=" + lon + "&appid=" + apiKey + "&units=metric";

  HTTPClient http;

  if (!http.begin(clientSecure, url)) return;

  int httpCode = http.GET();
  if (httpCode <= 0) return;

  String payload = http.getString();

  DynamicJsonDocument doc(7000);
  deserializeJson(doc, payload);

  JsonArray list = doc["list"];

  chanceChuvaAlta = false;

  // Verifica primeiras 3 previsões (8~9 horas)
  for (int i = 0; i < 3; i++) {
    float pop = list[i]["pop"].as<float>(); // probabilidade de precipitação (0–1)

    if (pop >= 0.70) {
      chanceChuvaAlta = true;
      break;
    }
  }

  http.end();
}

// ================================
// ---- DECISÃO IRRIGAÇÃO --------
// ================================
void tomarDecisaoIrrigacao() {
  timeClient.update();

  bool horarioPermitido = true; // depois vem do banco

  bool soloSeco = (umidadeArduino >= 500);
  bool semChuvaAgora = (chuvaArduino >= 500);
  bool semChuva8h = !chanceChuvaAlta;

  if (horarioPermitido && soloSeco && semChuvaAgora && semChuva8h) {
    enviarComandoAoUno("LIGAR_VALVULA");
    statusUltimaAcao = "Irrigando (LIGADO)";
  } else {
    enviarComandoAoUno("DESLIGAR_VALVULA");
    statusUltimaAcao = "Desligado";
  }
}

// ================================
// ------- ENVIO AO UNO ----------
// ================================
void enviarComandoAoUno(String comando) {
  unoSerial.println(comando);
}

/*
 * ==========================================================
 * PROGRAMA: Cérebro de Irrigação (ESP-12E / NodeMCU)
 * VERSÃO:   Web Server + SoftwareSerial Corrigido
 * FUNÇÃO:   Receber JSON do Uno via D2/D3, buscar API,
 * decidir, enviar comandos de volta e
 * mostrar status em uma página web.
 * AUTOR:    Gemini
 * ==========================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>  // <-- NOVO: Para a página HTML
#include <SoftwareSerial.h>     // <-- Para falar com o Uno em pinos customizados
#include <WiFiClientSecure.h> 
#include <ESP8266HTTPClient.h>  
#include <ArduinoJson.h>      
#include <NTPClient.h>        
#include <WiFiUdp.h>          

// --- CONFIGURE AQUI (OBRIGATÓRIO) -------------------------
const char* ssid = "Irrigar";
const char* password = "vento123";
String apiKey = "b530897f08b4433bc6736eafe8867095"; 
String lat = "-10.8753"; 
String lon = "-61.9521"; 
const long fusoHorario_UTC_em_Segundos = -14400; 
// -----------------------------------------------------------

// --- Objetos Globais ---
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", fusoHorario_UTC_em_Segundos);
WiFiClientSecure clientSecure; 
ESP8266WebServer server(80); // <-- NOVO: Servidor na porta 80

// --- Comunicação com Arduino Uno ---
// ATENÇÃO: D2 = GPIO4, D3 = GPIO0
// D2 (GPIO4) será o RX (ligado ao TX do Uno)
// D3 (GPIO0) será o TX (ligado ao RX do Uno)
#define UNO_RX_PIN D2
#define UNO_TX_PIN D3
SoftwareSerial unoSerial(UNO_RX_PIN, UNO_TX_PIN);
String jsonDoUno = ""; 

// --- Variáveis de Estado (para guardar os dados) ---
int umidadeArduino = 0;
int chuvaArduino = 0;
int fluxoArduino = 0;
bool vaiChoverNasProximas12h = false; 

unsigned long ultimoCheckTempo = 0;
const long intervaloCheckTempo = 3600000; 


// --- Funções (protótipos) ---
void handleRoot(); // Função que vai gerar a página HTML
void enviarComandoAoUno(String comando);


void setup() {
  // Serial (USB) é APENAS para depuração no PC
  Serial.begin(9600);
  
  // unoSerial (D2/D3) é APENAS para falar com o Uno
  unoSerial.begin(9600); // <-- NOVO: Inicia a SoftwareSerial
  
  jsonDoUno.reserve(256); 
  
  Serial.println("\n\nESP-12E INICIADO."); 
  Serial.println("Tentando conectar ao WiFi: " + String(ssid)); 
  
  setup_wifi();

  Serial.println("WiFi CONECTADO!"); 
  Serial.println("IP: " + WiFi.localIP().toString()); // <-- Este é o IP para ver a página

  // --- Configura o Servidor Web ---
  server.on("/", handleRoot); // Define a função para a página principal
  server.begin(); // Inicia o servidor
  Serial.println("Servidor Web iniciado. Acesse o IP acima."); // <-- NOVO DEBUG

  timeClient.begin();
  timeClient.update();
  Serial.println("Cliente NTP iniciado."); 

  clientSecure.setInsecure(); 

  Serial.println("Buscando previsao do tempo pela primeira vez..."); 
  buscarPrevisaoDoTempo();
  Serial.println("Setup completo. Ouvindo o Arduino Uno nos pinos D2/D3...");
}

void loop() {
  // 1. Ouve e processa os dados vindos do Arduino Uno
  receberDadosDoUno();

  // 2. Mantém o servidor web rodando
  server.handleClient(); // <-- NOVO: Responde a requisições HTTP

  // 3. Atualiza a previsão do tempo a cada 1 hora
  unsigned long agora = millis();
  if (agora - ultimoCheckTempo >= intervaloCheckTempo) {
    ultimoCheckTempo = agora;
    Serial.println("\n--- Ja passou 1 hora, buscando previsao novamente ---"); 
    buscarPrevisaoDoTempo();
  }
}

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("."); // Debug no PC
  }
  Serial.println(); // Debug no PC
}

/**
 * @brief Ouve a porta SoftwareSerial, lê o JSON do Uno
 * e salva os valores nas variáveis globais.
 */
void receberDadosDoUno() {
  // LÊ DA 'unoSerial' (D2/D3), NÃO DA 'Serial' (USB)
  while (unoSerial.available() > 0) { 
    char c = unoSerial.read(); // <-- MUDADO
    
    if (c == '\n') { 
      // Debug no PC
      Serial.print("JSON Recebido do Uno: "); 
      Serial.println(jsonDoUno); 

      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, jsonDoUno);

      if (error) {
        Serial.println("ERRO: Falha ao ler o JSON!"); 
        jsonDoUno = ""; 
        return;
      }

      Serial.println("JSON lido com sucesso."); 
      umidadeArduino = doc["umidade"];
      chuvaArduino = doc["chuva"];
      fluxoArduino = doc["fluxo"];
      
      Serial.println("Valores lidos: Umidade=" + String(umidadeArduino) + ", Chuva=" + String(chuvaArduino)); 

      tomarDecisaoIrrigacao();
      
      jsonDoUno = ""; 

    } else {
      jsonDoUno += c; 
    }
  }
}

/**
 * @brief Conecta na API OpenWeatherMap
 */
void buscarPrevisaoDoTempo() {
  String url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + 
               "&lon=" + lon + "&appid=" + apiKey + "&units=metric&lang=pt_br";

  HTTPClient http;
  
  Serial.println("Chamando API: " + url); // Debug no PC
  
  if (http.begin(clientSecure, url)) {
    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) { 
      String payload = http.getString();
      DynamicJsonDocument doc(16384); 
      deserializeJson(doc, payload);

      JsonArray list = doc["list"];
      bool achouChuva = false;

      for (int i = 0; i < 4; i++) { 
        float pop = list[i]["pop"]; 
        int id = list[i]["weather"][0]["id"]; 

        if (pop > 0.7 && id >= 500 && id < 600) {
          achouChuva = true;
          break; 
        }
      }
      
      vaiChoverNasProximas12h = achouChuva;
      Serial.println("Previsao atualizada. Vai chover nas prox. 12h? " + String(vaiChoverNasProximas12h ? "SIM" : "NAO"));

    } else {
      Serial.println("ERRO na chamada HTTP! Codigo: " + String(httpCode)); 
      vaiChoverNasProximas12h = false; 
    }
    http.end();
  } else {
      Serial.println("ERRO: Nao foi possivel iniciar conexao HTTP."); 
  }
}

/**
 * @brief A LÓGICA PRINCIPAL. Decide se liga ou desliga a válvula.
 */
void tomarDecisaoIrrigacao() {
  timeClient.update();
  int horaAtual = timeClient.getHours(); 

  bool soloEstaSeco = (umidadeArduino > 700); 
  bool estaChovendoAgora = (chuvaArduino < 800);
  bool ehHoraDeIrrigar = (horaAtual == 6); 
  
  Serial.println("--- Tomando Decisao ---"); 
  Serial.println("Hora atual: " + String(horaAtual)); 
  Serial.println("Eh hora de irrigar? " + String(ehHoraDeIrrigar ? "SIM" : "NAO")); 
  Serial.println("Solo esta seco? " + String(soloEstaSeco ? "SIM" : "NAO")); 
  Serial.println("Esta chovendo agora? " + String(estaChovendoAgora ? "SIM" : "NAO")); 
  Serial.println("Previsao de chuva? " + String(vaiChoverNasProximas12h ? "SIM" : "NAO")); 

  if (ehHoraDeIrrigar && soloEstaSeco && !estaChovendoAgora && !vaiChoverNasProximas12h) {
    enviarComandoAoUno("LIGAR_VALVULA");
  } else {
    enviarComandoAoUno("DESLIGAR_VALVULA");
  }
}

/**
 * @brief Envia o comando final para o Arduino Uno via SoftwareSerial
 */
void enviarComandoAoUno(String comando) {
  Serial.println("Comando final enviado ao Uno: " + comando); // Debug no PC
  unoSerial.println(comando); // <-- MUDADO: Envia pela 'unoSerial' (D2/D3)
}

/**
 * @brief GERA A PÁGINA HTML (Nova Função)
 */
void handleRoot() {
  timeClient.update();
  String hora = timeClient.getFormattedTime();

  String page = "<!DOCTYPE html><html>";
  page += "<head><title>Status Irrigacao</title>";
  page += "<meta http-equiv='refresh' content='5'>"; // Atualiza a página a cada 5 segundos
  page += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  page += "<style>";
  page += "body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 20px; }";
  page += ".container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }";
  page += "h1 { color: #333; text-align: center; }";
  page += ".data { font-size: 1.2em; }";
  page += ".data span { font-weight: bold; color: #0056b3; }";
  page += "</style></head>";
  page += "<body><div class='container'>";
  page += "<h1>Status da Irrigacao</h1>";
  page += "<div class='data'>";
  page += "<p>Hora Atual: <span>" + hora + "</span></p>";
  page += "<p>Leitura de Umidade: <span>" + String(umidadeArduino) + "</span></p>";
  page += "<p>Leitura de Chuva: <span>" + String(chuvaArduino) + "</span></p>";
  page += "<p>Leitura de Fluxo: <span>" + String(fluxoArduino) + "</span></p>";
  page += "<hr>";
  page += "<p>Previsao de Chuva (12h): <span>"
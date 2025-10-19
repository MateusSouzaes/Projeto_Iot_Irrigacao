// ===== CÓDIGO PARA O ESP-12E (NodeMCU) =====

#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Pinos para comunicação com o Arduino UNO
// RX do NodeMCU no D7, TX no D8
SoftwareSerial unoSerial(D7, D8); // RX, TX

// --- Configuração do Wi-Fi ---
const char* ssid = "Irrigar";       // <-- COLOQUE O NOME DA SUA REDE AQUI
const char* password = "vento123"; // <-- COLOQUE A SENHA AQUI

// --- Configuração para buscar a hora na internet (NTP) ---
// Para o Brasil, o fuso horário é UTC-3 ( -3 * 3600 = -10800 segundos)
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", -10800, 60000);

void setup() {
  // Inicia o Monitor Serial (para depuração no PC)
  Serial.begin(115200);
  Serial.println("\nMonitor Serial do NodeMCU iniciado.");

  // Inicia a comunicação com o Arduino UNO
  unoSerial.begin(9600);
  Serial.println("Comunicação com o UNO iniciada na porta serial por software.");

  // Conecta ao Wi-Fi
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Inicia o cliente NTP para obter a hora
  timeClient.begin();
  Serial.println("Cliente NTP iniciado. ESP pronto para receber comandos.");
  unoSerial.println("ESP_PRONTO"); // Avisa ao UNO que está pronto
}

void loop() {
  // Verifica se o Arduino enviou algum comando
  if (unoSerial.available() > 0) {
    String comando = unoSerial.readStringUntil('\n');
    comando.trim(); // Limpa a string de caracteres invisíveis

    Serial.print("Comando recebido do UNO: ");
    Serial.println(comando);

    // Se o comando for "GET_TIME", busca a hora e responde
    if (comando == "GET_TIME") {
      Serial.println("Buscando hora atual...");
      timeClient.update(); // Atualiza a informação da hora
      
      String horaFormatada = timeClient.getFormattedTime();
      Serial.print("Hora atual: ");
      Serial.println(horaFormatada);

      // Envia a hora para o Arduino
      Serial.println("Enviando hora para o UNO...");
      unoSerial.println(horaFormatada);
    }
  }
}
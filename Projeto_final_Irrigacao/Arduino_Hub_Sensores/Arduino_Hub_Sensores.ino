/*
 * ==========================================================
 * PROGRAMA: Hub de Sensores para Irrigação (Arduino Uno)
 * FUNÇÃO:   Ler todos os sensores, enviar via JSON para o ESP
 * e receber comandos de volta (LIGAR/DESLIGAR).
 * AUTOR:    Gemini (baseado no código de Mateus)
 * ==========================================================
 */

#include <SoftwareSerial.h> // Para comunicar com o ESP
#include <ArduinoJson.h>      // Para criar o JSON de envio

// --- Pinos de Comunicação com o ESP-12E ---
// Conecte o pino 2 do Uno no TX do ESP
// Conecte o pino 3 do Uno no RX do ESP
#define ESP_RX_PIN 2
#define ESP_TX_PIN 3
SoftwareSerial espSerial(ESP_RX_PIN, ESP_TX_PIN);

// --- Pinos dos Sensores (Entradas Analógicas) ---
#define pino_sensor_chuva A1
#define pino_sensor_umidade A2
#define pino_sensor_fluxo A5 // Corrigido (original estava em A5)

// --- Pinos do Atuador (Saída Digital) ---
#define pino_valvula 5 // Corrigido (original estava em A5)

// --- Variáveis de Controle ---
unsigned long ultimoEnvio = 0;
const long intervaloEnvio = 5000; // Envia dados para o ESP a cada 5 segundos
String comandoESP = "";            // Armazena comandos vindos do ESP

void setup() {
  // Inicia o Serial Monitor (para debug no PC)
  Serial.begin(9600);
  Serial.println("Arduino Uno - Hub de Sensores - Iniciado.");
  Serial.println("Aguardando comandos do ESP...");

  // Inicia a comunicação com o ESP-12E
  espSerial.begin(9600);

  // Configura o pino da válvula como SAÍDA
  pinMode(pino_valvula, OUTPUT);
  digitalWrite(pino_valvula, LOW); // Garante que comece desligada

  // Pinos analógicos (A0-A5) são INPUT por padrão
  
  comandoESP.reserve(32); // Reserva 32 bytes para a string de comando
}

void loop() {
  // 1. Verifica se recebeu comandos do ESP
  receberComandosESP();

  // 2. Verifica se está na hora de ler e enviar os dados dos sensores
  unsigned long agora = millis();
  if (agora - ultimoEnvio >= intervaloEnvio) {
    ultimoEnvio = agora; // Reseta o timer
    lerEEnviarSensores();
  }
}

/**
 * @brief Lê todos os sensores e envia via JSON para o ESP.
 */
void lerEEnviarSensores() {
  // 1. Lê os valores brutos dos sensores
  int umidade = analogRead(pino_sensor_umidade);
  int chuva = analogRead(pino_sensor_chuva);
  int fluxo = analogRead(pino_sensor_fluxo); // (Leitura de fluxo: ver nota)

  // 2. Monta o JSON (usando ArduinoJson)
  // StaticJsonDocument<200> reserva 200 bytes na memória para o JSON
  StaticJsonDocument<200> doc;
  doc["id_dispositivo"] = "uno_planta";
  doc["umidade"] = umidade;
  doc["chuva"] = chuva;
  doc["fluxo"] = fluxo;

  // 3. Envia o JSON para o ESP-12E
  Serial.print("Enviando para ESP: ");
  serializeJson(doc, Serial); // Mostra no PC o que vai enviar
  Serial.println();
  
  serializeJson(doc, espSerial); // Envia DE VERDADE para o ESP
  espSerial.println(); // Envia uma quebra de linha (LF) para o ESP saber que o JSON terminou
}

/**
 * @brief Fica ouvindo a porta serial do ESP por comandos.
 */
void receberComandosESP() {
  while (espSerial.available() > 0) {
    char c = espSerial.read();

    if (c == '\n') { // '\n' (newline) marca o fim do comando
      // Comando recebido, vamos processar
      Serial.print("Comando recebido do ESP: '");
      Serial.print(comandoESP);
      Serial.println("'");

      // 2. Executa a ação
      if (comandoESP == "LIGAR_VALVULA") {
        Serial.println("Acao: Ligando a valvula.");
        digitalWrite(pino_valvula, HIGH);
        
      } 
      else if (comandoESP == "DESLIGAR_VALVULA") {
        Serial.println("Acao: Desligando a valvula.");
        digitalWrite(pino_valvula, LOW);
      }
      
      // 3. Limpa a variável para o próximo comando
      comandoESP = ""; 

    } else {
      // Vai montando a string do comando caractere por caractere
      comandoESP += c;
    }
  }
}
// ===== CÓDIGO PARA O ARDUINO UNO =====

#include <SoftwareSerial.h>

// Pinos para comunicação com o ESP8266
// RX do UNO no pino 2, TX do UNO no pino 3
SoftwareSerial espSerial(2, 3); // RX, TX

// Variáveis para controle de tempo
unsigned long tempoAnterior = 0;
const long intervalo = 10000; // Intervalo de 10 segundos para pedir a hora

void setup() {
  // Inicia o Monitor Serial (para exibir resultados no PC)
  Serial.begin(9600);
  Serial.println("Monitor Serial do UNO iniciado.");

  // Inicia a comunicação com o ESP8266
  espSerial.begin(9600);
  Serial.println("Aguardando o ESP ficar pronto...");

  // Espera o ESP enviar a mensagem "ESP_PRONTO"
  while (!espSerial.available()); // Trava aqui até receber algo
  String respostaInicial = espSerial.readStringUntil('\n');
  if (respostaInicial.indexOf("ESP_PRONTO") >= 0) {
     Serial.println("ESP confirmou que está pronto! Iniciando pedidos.");
  }
}

void loop() {
  // Pede a hora para o ESP a cada 'intervalo' de tempo
  unsigned long tempoAtual = millis();
  if (tempoAtual - tempoAnterior >= intervalo) {
    tempoAnterior = tempoAtual;

    Serial.println("\nPedindo a hora para o ESP...");
    espSerial.println("GET_TIME"); // Envia o comando
  }

  // Verifica se o ESP respondeu
  if (espSerial.available() > 0) {
    String horaRecebida = espSerial.readStringUntil('\n');
    horaRecebida.trim();
    
    Serial.print("Hora recebida do ESP: ");
    Serial.println(horaRecebida);
  }
}
//Programa: Monitoracao de planta usando Arduino
//Autor: MakerHero + Mateus

#define pino_sensor_umidade01 A0
#define pino_sensor_umidade02 A1
#define pino_led_vermelho 5
#define pino_led_amarelo 6
#define pino_led_verde 7
#define pino_chuva A5   // saída analógica do sensor HL-83

int valor_umidade01, valor_umidade02;
int nivel_umidade[3];

void setup()
{
  Serial.begin(9600);
  pinMode(pino_sensor_umidade01, INPUT);
  pinMode(pino_sensor_umidade02, INPUT);
  pinMode(pino_led_vermelho, OUTPUT);
  pinMode(pino_led_amarelo, OUTPUT);
  pinMode(pino_led_verde, OUTPUT);
}

void apagaleds()
{
  digitalWrite(pino_led_vermelho, LOW);
  digitalWrite(pino_led_amarelo, LOW);
  digitalWrite(pino_led_verde, LOW);
}

void verifica_umidade(int n_sensor, int sensor_umidade, int nivel_umidade[3]){
  Serial.println("O sensor " + String(n_sensor) + ": " + String(valor_umidade));

  if (sensor_umidade >= nivel_umidade[0] && sensor_umidade < nivel_umidade[1])
  {
    Serial.println(" Status: Solo Umido");
    apagaleds();
    digitalWrite(pino_led_verde, HIGH);
  }
  else if (sensor_umidade >= nivel_umidade[1] && sensor_umidade < nivel_umidade[2])
  {
    Serial.println(" Status: Umidade moderada");
    apagaleds();
    digitalWrite(pino_led_amarelo, HIGH);
  }
  else if (sensor_umidade >= nivel_umidade[2])
  {
    Serial.println(" Status: Solo Seco");
    apagaleds();
    digitalWrite(pino_led_vermelho, HIGH);
  }
}

void verifica_chuva() {
  int valor_chuva = analogRead(pino_chuva);

  Serial.print("Valor chuva (A5): ");
  Serial.println(valor_chuva);

  // Ajuste o limite conforme calibrar seu sensor
  if (valor_chuva < 500) {  
    Serial.println(" Status: Está chovendo 🌧️");
  } else {
    Serial.println(" Status: Sem chuva ☀️");
  }
}

void loop()
{
  valor_umidade01 = analogRead(pino_sensor_umidade01);
  valor_umidade02 = analogRead(pino_sensor_umidade02);

  int cacto[3] = {400, 600, 800}; // ajuste os limites conforme seu solo

  verifica_umidade(1, valor_umidade01, cacto );
  verifica_umidade(2, valor_umidade02, cacto );

  verifica_chuva(); // agora só usa o analógico do HL-83

  delay(2000);
  Serial.println("-------------------");
}

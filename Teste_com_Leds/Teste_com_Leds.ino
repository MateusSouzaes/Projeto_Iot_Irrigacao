//Programa: Monitoracao de planta usando Arduino
//Autor: Mateus

// Definindo as saídas e entradas Do arduino
#define pino_sensor_umidade01 A0  // primeiro Sensor de Umidade
#define pino_sensor_umidade02 A1  // Segundo Sensor de Umidade
#define pino_led_vermelho 5       
#define pino_led_amarelo 6
#define pino_led_verde 7
#define pino_chuva A5   // saída analógica do sensor HL-83 

int valor_umidade01, valor_umidade02;
int nivel_umidade[3];

// Inicialição do sistema defindo a porta serial e os Inputs e OutPut
void setup()
{
  Serial.begin(9600);
  pinMode(pino_sensor_umidade01, INPUT);
  pinMode(pino_sensor_umidade02, INPUT);
  pinMode(pino_led_vermelho, OUTPUT);
  pinMode(pino_led_amarelo, OUTPUT);
  pinMode(pino_led_verde, OUTPUT);
}

// Aqui começam as Funções toda ação que será realizada no sistema será através de funções onde vamos definir as entradas 
// As entradas de cada função ainda não estão 100% definidas e podem ser reordenadas

void apagaleds()  // Os leds são apenas para termos uma idéia e facilitada no entendimento, mas no projeto final não terá nenhuma led
{
  digitalWrite(pino_led_vermelho, LOW);
  digitalWrite(pino_led_amarelo, LOW);
  digitalWrite(pino_led_verde, LOW);
}

/* Esta função define um numero para o sensor, para mostrar ao usuário ( talvez podemos trocar por nome tbm, mas a gente vê depois)
Também pega de entrada o valor analogico gerado pelo sensor de umidade (teremos que entender ao certo oq esse parametro que vai do 0 ao 1023 siginifica para uma planta, se alguém encontrar alguma referência seria top)
E tbm um vetor com 3 valores aonde definirá este nivel de umidade
*/
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

/* Este sensor analogico ele dá um valor tbm de 0 a 1023 temos que definir um valor para ser considerado chuva, ou talvez um tempo para isso ( não sei)*/
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

/* Aqui é a função principal, como se fosse o "Program" do Arduino, ela vai ficar repetindo várias vezes a cada delay(x) - valor que a gente determinar que vai ficar de intervalo */
void loop()
{
  valor_umidade01 = analogRead(pino_sensor_umidade01); 
  valor_umidade02 = analogRead(pino_sensor_umidade02);

  int cacto[3] = {400, 600, 800}; // Nesse caso criei uma pré definição de um tipo de solo, podemos pré-definir alguns para deixar o usuário selecionar entre eles 

  verifica_umidade(1, valor_umidade01, cacto );
  verifica_umidade(2, valor_umidade02, cacto );

  verifica_chuva(); // verifica se está chuvendo

  delay(2000); // este delay é em milissegundo, ou seja cada 1000ms é igual a 1 segundo
  Serial.println("-------------------");
}

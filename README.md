# 🌱 IRRIGA+ (Sistema de Irrigação Automático)

> Projeto desenvolvido para a disciplina de **Internet das Coisas (IoT)** do curso de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) do **Instituto Federal de Rondônia (IFRO) - Campus Ji-Paraná**.

## 📖 Sobre o Projeto

O **Irriga+** é uma solução de automação residencial focada na gestão inteligente de recursos hídricos para jardins. O sistema não apenas automatiza a rega, mas toma decisões baseadas em dados ambientais locais e previsões meteorológicas, evitando desperdícios e garantindo a saúde das plantas.

Diferente de sistemas baseados apenas em temporizadores (timers), o Irriga+ analisa a umidade real do solo e consulta APIs de clima antes de acionar a irrigação.

## 👥 Autores

**Orientador:** Prof. Wanderson Roger de Azevedo Dias

**Equipe de Desenvolvimento:**
- Fernando Oliveira Sampaio
- Joel de Araújo Pereira Junior
- Kauany Miranda Dantas
- Mateus Souza e Silva
- Mateus Viana de Oliveira
- Rafaela Pereira da Silva
- William da Silva Matsunaga

---

## 🛠️ Hardware e Componentes Utilizados

O projeto utiliza uma arquitetura híbrida de microcontroladores para garantir eficiência na leitura analógica e conectividade Wi-Fi.

### Microcontroladores
- **Arduino UNO:** Atua como o "Hub de Sensores". Responsável pela leitura precisa das portas analógicas e pelo acionamento físico dos relés.
- **ESP8266 (NodeMCU ESP-12E):** Atua como o "Cérebro e Gateway". Responsável pela conexão Wi-Fi, processamento lógico, consulta à API de clima e controle das decisões de irrigação.

### Sensores e Atuadores
- **Sensor de Umidade do Solo:** Monitora a resistividade do solo para determinar a necessidade de água.
- **Sensor de Chuva:** Detecta precipitação em tempo real no local da instalação.
- **Sensor de Fluxo de Água:** Mede o volume de água consumido durante o ciclo de irrigação.
- **Módulo Relé:** Chave eletrônica para ligar/desligar a bomba de água.
- **Bomba de Água:** Responsável pelo fluxo hidráulico do sistema.

### Outros Materiais
- Protoboard e Jumpers.
- Mangueiras para irrigação.

---

## ⚙️ Funcionamento do Sistema (Lógica de Controle)

O sistema opera através da comunicação serial (UART) entre o Arduino e o ESP8266, seguindo o fluxo lógico abaixo:

### 1. Monitoramento (Arduino)
O Arduino realiza leituras constantes dos sensores (Umidade, Chuva e Fluxo). Ele processa esses dados brutos e os envia em formato JSON via comunicação serial para o módulo ESP8266.

### 2. Inteligência e Conectividade (ESP8266)
O ESP8266 recebe os dados do Arduino e executa a lógica de decisão:
- **Consulta à API:** A cada 3 horas, o sistema consulta a API **OpenWeatherMap** para verificar a previsão de chuva para a região.
- **Verificação de Condições:** O sistema cruza as informações:
    * *O solo está seco?*
    * *Está chovendo agora (Sensor de Chuva)?*
    * *Vai chover nas próximas horas (API)?*

### 3. Atuação e Segurança
- **Início da Irrigação:** Se o solo estiver seco **E** não houver previsão de chuva **E** não estiver chovendo, o ESP envia o comando `LIGAR_VALVULA` para o Arduino, que aciona o relé.
- **Interrupção Imediata:** Se começar a chover durante a irrigação (detectado pelo sensor físico), o sistema envia o comando de desligamento imediatamente para economizar água.
- **Registro:** Ao finalizar, o volume de água contabilizado pelo sensor de fluxo é registrado e enviado para o banco de dados para histórico de consumo.

---

## 💻 Tecnologias

- **Linguagem:** C++ (Wiring) para firmware.
- **Comunicação:** Protocolo Serial (Entre Arduíno e ESP) e HTTP (API Externa).
- **API Externa:** OpenWeatherMap (Previsão do Tempo).
- **Formato de Dados:** JSON.

---
-*Ji-Paraná, 2025.*
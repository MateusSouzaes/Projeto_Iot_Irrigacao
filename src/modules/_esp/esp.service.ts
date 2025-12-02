import { Injectable } from '@nestjs/common';

@Injectable()
export class EspService {
  async pegarDados() {
    const ESP_IP = "http://192.168.214.136/api/sensores"; // coloque o IP do seu ESP

    try {
      const response = await fetch(ESP_IP);
      const dados = await response.json();
      return dados;
    } catch (e) {
      console.log("Erro ao conectar ao ESP:", e);
      return {
        umidade: "--",
        chuva: "--",
        fluxo: "--",
        vaiChover12h: false,
      };
    }
  }
}

// src/modules/esp/esp.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EspService implements OnModuleInit {
  // Estado do fluxo mantido no service (persistirá enquanto o processo Node estiver vivo)
  private ultimoTempoFluxoMs = Date.now();
  private volumeTotalML = 0; // volume acumulado em mL

  // Limites de chuva (valores analógicos do sensor HL-83)
  private CHUVA_INTENSA_THRESHOLD = 300;
  private CHUVA_MODERADA_THRESHOLD = 600;
  private CHUVA_FRACA_THRESHOLD = 800;

  onModuleInit() {
    this.ultimoTempoFluxoMs = Date.now();
  }

  // -------------------------------------------------------------
  // HELPERS / CONVERSÕES
  // -------------------------------------------------------------

  private clamp01(value: number) {
    if (Number.isNaN(value)) return 0;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  /** Converte leitura 0..1023 do HW-103 em % umidade do solo:
   *  Inverte porque sensor dá valor maior quando seco (1023 = seco).
   *  Retorna inteiro 0..100.
   */
  private umidadePercentFromAnalog(valor: number): number {
    const v = Math.max(0, Math.min(1023, Number(valor ?? 0)));
    const percent = (1 - v / 1023) * 100;
    return Math.round(percent);
  }

  /** Converte leitura HL-83 em "porcentagem de chuva" (aprox):
   *  HL-83: 0 = molhado, 1023 = seco -> invertendo para 0..100% chuva
   */
  private chuvaPercentFromAnalog(valor: number): number {
    const v = Math.max(0, Math.min(1023, Number(valor ?? 0)));
    const percent = (1 - v / 1023) * 100;
    return Math.round(percent);
  }

  /** Classifica em 3 níveis (fraca / chuva / chuva intensa / sem chuva) */
  private nivelChuvaFromAnalog(valor: number):
    | 'Chuva intensa'
    | 'Chuva'
    | 'Chuva fraca'
    | 'Sem chuva' {
    const v = Number(valor ?? 1023);
    if (v <= this.CHUVA_INTENSA_THRESHOLD) return 'Chuva intensa';
    if (v <= this.CHUVA_MODERADA_THRESHOLD) return 'Chuva';
    if (v <= this.CHUVA_FRACA_THRESHOLD) return 'Chuva fraca';
    return 'Sem chuva';
  }

  // -------------------------------------------------------------
  // FLUXO DE ÁGUA (mL/min)
  // -------------------------------------------------------------
  /**
   * Estimativa do fluxo em mL/min.
   * Aproximação: f = leitura/10 ; Q(L/min) = f/7.5 ; mL/min = Q * 1000
   * Observação: sensor YF-S201 normalmente entrega pulsos digitais — aqui é uma aproximação por leitura analógica.
   * Ignora leituras < 100 (consideradas ruído/padrão).
   */
  private fluxoEstimado_MLporMin(leituraFluxo: number): number {
    const lv = Number(leituraFluxo ?? 0);

    // ruído/padrão do sensor: se <= 100 considerar fechado/zero
    if (lv <= 100) return 0;

    const f = lv / 10.0; // "pulsos" aproximados
    const Q_Lmin = f / 7.5;
    const Q_mLmin = Q_Lmin * 1000;
    return Number(Q_mLmin.toFixed(2));
  }

  /** Atualiza volume total (mL) acumulado — usa dt entre chamadas e estado interno */
  private atualizarVolumeAcumulado(leituraFluxo: number) {
    const agora = Date.now();
    const dt = (agora - this.ultimoTempoFluxoMs) / 1000.0; // segundos
    this.ultimoTempoFluxoMs = agora;

    const fluxo_mLmin = this.fluxoEstimado_MLporMin(leituraFluxo);
    if (fluxo_mLmin <= 0) {
      return Number(this.volumeTotalML.toFixed(2));
    }

    const q_mL_s = fluxo_mLmin / 60.0; // mL por segundo
    this.volumeTotalML += q_mL_s * dt;
    return Number(this.volumeTotalML.toFixed(2));
  }

  // -------------------------------------------------------------
  // FORMATAÇÃO DE DATA
  // -------------------------------------------------------------
  private formatarData(input?: string | number): string {
    if (input === undefined || input === null) return '--';

    let dateObj: Date;

    if (typeof input === 'number') {
      const n = input;
      // se for em segundos (menor que ~1e11) converte para ms
      if (n < 1e11) dateObj = new Date(n * 1000);
      else dateObj = new Date(n);
    } else {
      const maybe = Number(input as string);
      if (!Number.isNaN(maybe) && String(input).trim().match(/^\d+$/)) {
        return this.formatarData(maybe);
      }
      dateObj = new Date(String(input));
    }

    if (isNaN(dateObj.getTime())) return '--';

    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // -------------------------------------------------------------
  // MÉTODO PÚBLICO: buscar status do ESP e formatar para o front
  // -------------------------------------------------------------
  async buscarStatusESP() {
    // URL do ESP pode ser configurada por variável de ambiente ESP_URL
    const espUrl = (process.env.ESP_URL && process.env.ESP_URL.trim())
      ? process.env.ESP_URL.trim().replace(/\/+$/, '')
      : 'http://192.168.214.136';

    const maxRetries = 2;
    const timeoutMs = 8000;
    let dados: any = null;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = `${espUrl}/status`;
        const resposta = await axios.get<any>(url, { timeout: timeoutMs });
        dados = resposta.data;
        break;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!dados) {
      console.error('Falha ao conectar no ESP:', (lastError as any)?.message ?? lastError);
      return {
        error: 'Não foi possível conectar ao ESP',
        ip: '--',
        ultimaAtualizacao: '--',
        online: false,
        raw: null,
        display: {
          chuva: '--',
          umidade: '--',
          fluxo_ml_min: '--',
          volume_l_total: '--',
          data: '--',
          ip: '--',
          online: false,
        },
      };
    }

    // aqui dados foi obtido do ESP
    const rawChuva = Number(dados?.chuva ?? dados?.rain ?? 1023);
    const rawUmidade = Number(dados?.umidade ?? dados?.humidity ?? 0);
    const rawFluxo = Number(dados?.fluxo ?? dados?.flow ?? 0);
    const rawHora = dados?.hora ?? undefined;
    const rawData = dados?.data ?? undefined;
    const ip = dados?.ip ?? undefined;
    const online = typeof dados?.online === 'boolean' ? dados.online : true;
    console.log('Dados brutos recebidos do ESP:', dados);

    const chuvaPercent = this.chuvaPercentFromAnalog(rawChuva);
    const chuvaNivel = this.nivelChuvaFromAnalog(rawChuva);
    const umidadePercent = this.umidadePercentFromAnalog(rawUmidade);
    const fluxo_mLmin = this.fluxoEstimado_MLporMin(rawFluxo);
    const volumeTotal_mL = this.atualizarVolumeAcumulado(rawFluxo);
    const dataFormatada = this.formatarData(rawData ?? rawHora ?? Date.now());

    const volumeLitros = Number((volumeTotal_mL / 1000).toFixed(3));

    const resultado = {
      ip,
      ultimaAtualizacao: dataFormatada,
      online,
      raw: {
        chuva: rawChuva,
        umidade: rawUmidade,
        fluxo: rawFluxo,
        hora: rawHora,
        data: rawData,
        ip,
        online,
      },
      display: {
        chuva: `${chuvaNivel} (${chuvaPercent}%)`,
        umidade: `${umidadePercent}%`,
        fluxo_ml_min: `${fluxo_mLmin} mL/min`,
        volume_l_total: `${volumeLitros} L`,
        data: dataFormatada,
        ip,
        online,
      },
    };

    return resultado;
  }

  // opcional: rota que recebe leitura POST do ESP
  async salvarLeitura(dados: any) {
    console.log('Leitura recebida:', dados);
    return { mensagem: 'Leitura recebida', dados };
  }
}

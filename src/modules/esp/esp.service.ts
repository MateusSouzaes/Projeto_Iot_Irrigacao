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
    try {
      // tipando resposta como any evita problemas de acesso às propriedades
      const resposta = await axios.get<any>('http://192.168.107.136/status', {
        timeout: 8000,
      });

      // aqui dados tem tipo any e o TS não reclamará ao acessar propriedades
      const dados = resposta.data;

      // valores brutos do ESP (tente manter os nomes que o ESP envia)
      const rawChuva = Number(dados?.chuva ?? dados?.rain ?? 1023);
      const rawUmidade = Number(dados?.umidade ?? dados?.humidity ?? 0);
      const rawFluxo = Number(dados?.fluxo ?? dados?.flow ?? 0);
      const rawHora = dados?.hora ?? undefined;
      const rawData = dados?.data ?? undefined;
      const ip = dados?.ip ?? undefined;
      const online = typeof dados?.online === 'boolean' ? dados.online : true;
      console.log('Dados brutos recebidos do ESP:', dados);

      // processamento
      const chuvaPercent = this.chuvaPercentFromAnalog(rawChuva); // 0..100
      const chuvaNivel = this.nivelChuvaFromAnalog(rawChuva);
      const umidadePercent = this.umidadePercentFromAnalog(rawUmidade);

      const fluxo_mLmin = this.fluxoEstimado_MLporMin(rawFluxo); // mL/min
      const volumeTotal_mL = this.atualizarVolumeAcumulado(rawFluxo); // mL acumulado

      const dataFormatada = this.formatarData(rawData ?? rawHora ?? Date.now());

      // retorno com brutos + display formatado (usado pelo front)
      return {
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
          chuvaPercent: `${chuvaPercent}%`,
          chuvaNivel, // string do nível
          umidadePercent: `${umidadePercent}%`,

          // fluxo em mL/min e volume total em mL
          fluxo_mL_min: `${fluxo_mLmin} mL/min`,
          volume_total_mL: `${volumeTotal_mL} mL`,

          // data formatada para exibição
          dataFormatada,
          ip,
          online,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar status do ESP:', (error as any)?.message ?? error);
      return {
        error: 'Não foi possível conectar ao ESP',
        raw: null,
        display: {
          chuvaPercent: '--',
          chuvaNivel: '--',
          umidadePercent: '--',
          fluxo_mL_min: '--',
          volume_total_mL: '--',
          dataFormatada: '--',
          ip: '--',
          online: false,
        },
      };
    }
  }

  // opcional: rota que recebe leitura POST do ESP
  async salvarLeitura(dados: any) {
    console.log('Leitura recebida:', dados);
    return { mensagem: 'Leitura recebida', dados };
  }
}

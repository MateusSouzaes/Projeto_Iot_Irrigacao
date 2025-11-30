import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface Previsao {
  diaSemana: string;
  dataFormatada: string;
  descricao: string;
  icone: string;
  temp: number;
  temp_min: number;
  temp_max: number;
  porcent_chuva: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey = 'b530897f08b4433bc6736eafe8867095';

  constructor(private readonly httpService: HttpService) {}

  // 🌡️ CLIMA ATUAL
  async getWeather(lat: number, lon: number) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
    const { data } = await firstValueFrom(this.httpService.get(url));

    return {
      cidade: data.name,
      estado: "",
      pais: data.sys.country,
      descricao: data.weather[0].description,
      icone: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      temp: Math.round(data.main.temp),
      temp_max: Math.round(data.main.temp_max),
      temp_min: Math.round(data.main.temp_min),
      umidade: data.main.humidity,
      vento: (data.wind.speed * 3.6).toFixed(1),
    };
  }

  // 🌤️ PREVISÃO DOS PRÓXIMOS DIAS
  async getForecast(lat: number, lon: number): Promise<Previsao[]> {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
    const { data } = await firstValueFrom(this.httpService.get(url));

    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const previsoes: Previsao[] = [];
    const groupedByDay: Record<string, any[]> = {};

    // Agrupa por dia
    data.list.forEach((item: any) => {
      const dateStr = item.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
      if (!groupedByDay[dateStr]) groupedByDay[dateStr] = [];
      groupedByDay[dateStr].push(item);
    });

    for (const dateStr in groupedByDay) {
      const itensDoDia = groupedByDay[dateStr];
      const dataObj = new Date(itensDoDia[0].dt * 1000);

      // média de probabilidade de chuva do dia
      const popMedia = itensDoDia.reduce((sum, i) => sum + (i.pop || 0), 0) / itensDoDia.length;

      previsoes.push({
        diaSemana: diasSemana[dataObj.getDay()],
        dataFormatada: `${dataObj.getDate()}/${dataObj.getMonth() + 1}`,
        descricao: itensDoDia[0].weather[0].description,
        icone: `https://openweathermap.org/img/wn/${itensDoDia[0].weather[0].icon}@2x.png`,
        temp: Math.round(itensDoDia[0].main.temp),
        temp_min: Math.round(Math.min(...itensDoDia.map(i => i.main.temp_min))),
        temp_max: Math.round(Math.max(...itensDoDia.map(i => i.main.temp_max))),
        porcent_chuva: Math.round(popMedia * 100),
      });
    }

    return previsoes;
  }
}

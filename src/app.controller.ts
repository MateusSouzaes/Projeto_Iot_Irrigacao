import { Controller, Get, Render, Query } from '@nestjs/common';
import { WeatherService } from './weather/weather.service';
import { PlantaService } from './modules/planta/planta.service';
import { Previsao } from './weather/weather.service';

@Controller()
export class AppController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly plantaService: PlantaService,
  ) {}

  @Get()
  @Render('home')
  async home() {
    const latitude = -10.8777;
    const longitude = -61.9326;

    const clima = await this.weatherService.getWeather(latitude, longitude);

    (clima as any).cidade = "Ji-Paraná";
(clima as any).estado = "RO";
(clima as any).pais = "Brasil";

    const previsao = await this.weatherService.getForecast(latitude, longitude);

    const ultimasPlantas = await this.plantaService.listarUltimas(3);

    return {
      title: 'Início - Irriga+',
      clima,
      previsao,
      ultimasPlantas
    };
  }
}

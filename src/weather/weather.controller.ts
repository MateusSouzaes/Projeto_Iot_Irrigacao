import { Controller, Get } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Previsao } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async showWeather() {
    const latitude = -10.8777;
    const longitude = -61.9326;

    const clima = await this.weatherService.getWeather(latitude, longitude);
    const previsao = await this.weatherService.getForecast(latitude, longitude);

    return { 
      cidade: 'Ji-Paraná - RO',
      clima, 
      previsao 
    };
  }

  @Get('/previsao')
  async previsao() {
    const latitude = -10.8777;
    const longitude = -61.9326;

    const previsao = await this.weatherService.getForecast(latitude, longitude);

    return { 
      cidade: 'Ji-Paraná - RO',
      previsao 
    };
  }
}

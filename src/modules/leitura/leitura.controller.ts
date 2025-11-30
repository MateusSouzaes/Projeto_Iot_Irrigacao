import { Controller, Get, Render } from '@nestjs/common';
import { LeituraService } from './leitura.service';

@Controller('leitura')
export class LeituraController {
  constructor(private readonly leituraService: LeituraService) {}

  // Retorna JSON para ESP ou AJAX
  @Get('json')
  async listarJson() {
    return this.leituraService.listarTodas();
  }

  // Retorna página HTML com Handlebars
  @Get()
  @Render('leituras')
  async listarView() {
    const leituras = await this.leituraService.listarTodas();
    return { leituras };
  }
}

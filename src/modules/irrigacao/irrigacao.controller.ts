import { Controller, Get, Post, Body, Render } from '@nestjs/common';
import { IrrigacaoService } from './irrigacao.service';

@Controller('/irrigacao')
export class IrrigacaoController {
  constructor(private readonly irrigacaoService: IrrigacaoService) {}

  @Get('/dashboard')
  @Render('irrigacao/dashboard') 
  async dashboard() {
    const status = await this.irrigacaoService.statusAtual();
    const lista = await this.irrigacaoService.listarTodas();
    return { status, lista };
  }

  @Get('json')
  async listarJson() {
    return this.irrigacaoService.listarTodas();
  }

  @Post()
  async criar(@Body() body) {
    return this.irrigacaoService.criar(body);
  }
}

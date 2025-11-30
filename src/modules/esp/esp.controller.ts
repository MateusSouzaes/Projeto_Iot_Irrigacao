import { Controller, Post, Get, Body } from '@nestjs/common';
import { EspService } from './esp.service';

@Controller('esp')
export class EspController {
  constructor(private readonly espService: EspService) {}

  @Post('receber')
  async receberDados(@Body() body: any) {
    console.log("Recebido do ESP:", body);
    return this.espService.salvarLeitura(body);
  }

  @Get('status')
  async getStatus() {
    return this.espService.buscarStatusESP();
  }
}

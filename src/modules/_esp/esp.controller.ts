import { Controller, Get, Res } from '@nestjs/common';
import { EspService } from './esp.service';

@Controller()
export class DashboardController {
  constructor(private readonly espService: EspService) {}

  @Get('/')
  async dashboard(@Res() res) {
    const sensores = await this.espService.pegarDados();

    res.render('dashboard', {
      sensores,
      agora: new Date().toLocaleString(),
    });
  }

  // API usada para atualizar via JS
  @Get('/api/sensores-web')
  async sensoresWeb() {
    return await this.espService.pegarDados();
  }
}

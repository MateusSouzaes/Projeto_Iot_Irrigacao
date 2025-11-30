import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { PlantaService } from './planta.service';
import { Response } from 'express';

@Controller('/planta')
export class PlantaController {
  constructor(private readonly plantaService: PlantaService) {}

  @Get('/novo')
  async formularioCadastro(@Res() res: Response) {
    const rotinas = await this.plantaService.listarRotinas();
    const necessidades = await this.plantaService.listarNecessidades();
    const sensores = await this.plantaService.listarSensores();

    return res.render('planta/formulario-cadastro', {
      layout: 'main',
      planta: {},
      rotinas,
      necessidades,
      sensores,
    });
  }

  @Post('/novo/salvar')
  async salvar(@Body() dadosForm: any, @Res() res: Response) {
    await this.plantaService.criar({
      nome: dadosForm.nome,
      rotinaId: Number(dadosForm.rotina_id),
      necessidadeId: Number(dadosForm.necessidade_hidrica_id),
      sensorId: Number(dadosForm.sensor_id),
    });

    return res.redirect('/planta/novo');
  }

  @Get('/editar/:id')
  async editarFormulario(@Param('id') id: string, @Res() res: Response) {
    const planta = await this.plantaService.buscarPorId(Number(id));
    if (!planta) return res.redirect('/planta/listagem');

    const rotinas = await this.plantaService.listarRotinas();
    const necessidades = await this.plantaService.listarNecessidades();
    const sensores = await this.plantaService.listarSensores();

    return res.render('planta/formulario-cadastro', {
      layout: 'main',
      planta,
      rotinas,
      necessidades,
      sensores,
    });
  }

  @Post('/editar/:id')
  async editarSalvar(@Param('id') id: string, @Body() dadosForm: any, @Res() res: Response) {
    await this.plantaService.atualizar(Number(id), {
      nome: dadosForm.nome,
      rotinaId: Number(dadosForm.rotina_id),
      necessidadeId: Number(dadosForm.necessidade_hidrica_id),
      sensorId: Number(dadosForm.sensor_id),
    });

    return res.redirect('/planta/listagem');
  }

  @Get('/listagem')
  async listar(@Res() res: Response) {
    const plantas = await this.plantaService.listar();
    return res.render('planta/listagem', {
      layout: 'main',
      plantas,
    });
  }

  @Get('/excluir/:id')
  async excluir(@Param('id') id: string, @Res() res: Response) {
    await this.plantaService.excluir(Number(id));
    return res.redirect('/planta/listagem');
  }
}

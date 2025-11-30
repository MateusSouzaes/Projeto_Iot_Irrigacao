import { Body, Controller, Get, Render, Post, Param, Req, Res, Query } from "@nestjs/common";
import { Request, Response } from "express";
import { SensorService } from "./sensor.service";

@Controller('/sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  // Listagem e pesquisa
  @Get()
  @Get('/listagem')
  @Render('sensor/listagem')
  async consulta(@Query('nome') nome?: string) {
    let sensores = await this.sensorService.listar();

    if (nome) {
      sensores = sensores.filter(sensor =>
        sensor.nome.toLowerCase().includes(nome.toLowerCase())
      );
    }

    return { sensores };
  }

  // Formulário de cadastro
  @Get('/novo')
  @Render('sensor/formulario-cadastro')
  async formularioCadastro() {
    const tiposSensores = await this.sensorService.listarTipos();
    return {
      sensor: { nome: '', localizacao: '', status: true, tipoSensor: null },
      tiposSensores,
    };
  }

  // Salvar novo sensor
  @Post('/novo/salvar')
  async formularioCadastroSalvar(@Body() dadosForm: any, @Req() req: Request, @Res() res: Response) {
    try {
      await this.sensorService.criar({
        nome: dadosForm.nome,
        localizacao: dadosForm.localizacao || '',
        tipoSensorId: Number(dadosForm.tipo_sensor_id),
        status: dadosForm.status === 'true', // converte string para boolean
      });

      req.addFlash('success', 'Sensor cadastrado com sucesso!');
      return res.redirect('/sensor');
    } catch (error) {
      const tiposSensores = await this.sensorService.listarTipos();
      return res.render('sensor/formulario-cadastro', {
        error: error.message,
        sensor: dadosForm,
        tiposSensores,
      });
    }
  }

  // Formulário de edição
  @Get('/editar/:id')
  @Render('sensor/formulario-cadastro')
  async editarFormulario(@Param('id') id: string) {
    const sensor = await this.sensorService.buscarPorId(Number(id));
    if (!sensor) {
      return { sensor: {}, tiposSensores: await this.sensorService.listarTipos(), error: 'Sensor não encontrado' };
    }

    const tiposSensores = await this.sensorService.listarTipos();
    return { sensor, tiposSensores };
  }

  // Salvar edição
  @Post('/editar/:id')
  async editarSalvar(@Param('id') id: string, @Body() dadosForm: any, @Res() res: Response) {
    try {
      await this.sensorService.atualizar(Number(id), {
        nome: dadosForm.nome,
        localizacao: dadosForm.localizacao || '',
        tipoSensorId: Number(dadosForm.tipo_sensor_id),
        status: dadosForm.status === 'true',
      });

      return res.redirect('/sensor');
    } catch (error) {
      const sensor = await this.sensorService.buscarPorId(Number(id));
      const tiposSensores = await this.sensorService.listarTipos();
      return res.render('sensor/formulario-cadastro', {
        error: error.message,
        sensor: { ...sensor, ...dadosForm },
        tiposSensores,
      });
    }
  }

  // Excluir
  @Get('/excluir/:id')
  async excluir(@Param('id') id: string, @Res() res: Response) {
    await this.sensorService.excluir(Number(id));
    return res.redirect('/sensor');
  }
}

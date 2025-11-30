import { Controller, Get, Post, Param, Body, Res, Req, Render } from '@nestjs/common';
import { RotinaService } from './rotina.service';
import { Request, Response } from 'express';
import { Rotina } from './rotina.entity';

@Controller('/rotina')
export class RotinaController {
  constructor(private readonly rotinaService: RotinaService) {}

  @Get('/listagem')
  @Render('rotina/listagem')
  async listar(@Req() req: Request) {
    const search = req.query.nome?.toString().toLowerCase() || '';
    let rotinas = await this.rotinaService.getAll();

    if (search) {
      rotinas = rotinas.filter(r => r.nome.toLowerCase().includes(search));
    }

    return { rotinas, search };
  }

  @Get('/novo')
  @Render('rotina/formulario-cadastro')
  formularioCadastro() {
    return {
      layout: 'main',
      title: 'Cadastro de Rotina',
      rotina: { nome: '', frequencia: '', dias: [], horarios: [], tipo_execucao: '' },
      frequencias: [1, 2, 3, 4],
      diasSemana: ["segunda","terca","quarta","quinta","sexta","sabado","domingo"]
    };
  }

  @Post('/novo/salvar')
  async formularioCadastroSalvar(@Body() dadosForm: any, @Req() req: Request, @Res() res: Response) {
    const dias = Array.isArray(dadosForm.dias) ? dadosForm.dias : [dadosForm.dias];
    const horarios = Array.isArray(dadosForm.horarios) ? dadosForm.horarios : [dadosForm.horarios];

    await this.rotinaService.create({ 
      nome: dadosForm.nome, 
      frequencia: dadosForm.frequencia, 
      dias, 
      horarios, 
      tipo_execucao: dadosForm.tipo_execucao 
    });

    req.addFlash('success', 'Rotina cadastrada com sucesso!');
    return res.redirect('/rotina/listagem');
  }

  @Get('/editar/:id')
  @Render('rotina/formulario-cadastro')
  async editarFormulario(@Param('id') id: string) {
    const rotina = await this.rotinaService.getById(Number(id));
    if (!rotina) return { error: 'Rotina não encontrada', diasSemana: ["segunda","terca","quarta","quinta","sexta","sabado","domingo"], frequencias: [1,2,3,4] };

    return {
      rotina,
      diasSemana: ["segunda","terca","quarta","quinta","sexta","sabado","domingo"],
      frequencias: [1,2,3,4]
    };
  }

  @Post('/editar/:id')
  async editarSalvar(@Param('id') id: string, @Body() dadosForm: any, @Res() res: Response) {
    const dias = Array.isArray(dadosForm.dias) ? dadosForm.dias : [dadosForm.dias];
    const horarios = Array.isArray(dadosForm.horarios) ? dadosForm.horarios : [dadosForm.horarios];

    await this.rotinaService.update(Number(id), {
      nome: dadosForm.nome,
      frequencia: dadosForm.frequencia,
      dias,
      horarios,
      tipo_execucao: dadosForm.tipo_execucao
    });

    return res.redirect('/rotina/listagem');
  }

  @Get('/excluir/:id')
  async excluir(@Param('id') id: string, @Res() res: Response) {
    await this.rotinaService.delete(Number(id));
    return res.redirect('/rotina/listagem');
  }
}

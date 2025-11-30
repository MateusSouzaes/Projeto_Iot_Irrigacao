import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('login')
export class LoginController {

  // Rota GET para mostrar a página de login sem layout
  @Get()
  getLoginPage(@Res() res: Response) {
    return res.render('login/login', { layout: false, title: 'Tela de Login' });
  }

  // Rota POST para processar o login
  @Post()
  handleLogin(@Body() body: { username: string; password: string }) {
    const { username, password } = body;

    if (username === 'devserbug@gmail.com' && password === '1234') {
      return 'Login realizado com sucesso!';
    } else {
      return 'Usuário ou senha incorretos!';
    }
  }
}

import { Module } from '@nestjs/common';
import { LoginController } from './login.controller'; // caminho correto

@Module({
  controllers: [LoginController],
  providers: [],
})
export class LoginModule {}

import { Module } from '@nestjs/common';
import { RotinaController } from './rotina.controller';
import { RotinaService } from './rotina.service';

@Module({
  controllers: [RotinaController],
  providers: [RotinaService],
})
export class RotinaModule {}

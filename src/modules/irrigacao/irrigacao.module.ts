import { Module } from '@nestjs/common';
import { IrrigacaoController } from './irrigacao.controller';
import { IrrigacaoService } from './irrigacao.service';
import { irrigacaoProviders } from './irrigacao.providers';
import { DatabaseModule } from 'src/database/database.module';
import { leituraProviders } from '../leitura/leitura.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [IrrigacaoController],
  providers: [
    ...irrigacaoProviders,
    ...leituraProviders, // para acessar a leituraSensor
    IrrigacaoService,
  ],
  exports: [...irrigacaoProviders],
})
export class IrrigacaoModule {}

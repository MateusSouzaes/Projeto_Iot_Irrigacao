import { Module } from '@nestjs/common';
import { LeituraService } from './leitura.service';
import { LeituraController } from './leitura.controller';
import { DatabaseModule } from 'src/database/database.module';
import { leituraProviders } from './leitura.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [LeituraController],
  providers: [...leituraProviders, LeituraService],
  exports: [...leituraProviders],
})
export class LeituraModule {}

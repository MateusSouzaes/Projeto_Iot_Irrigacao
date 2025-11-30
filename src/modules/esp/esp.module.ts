

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EspController } from './esp.controller';
import { EspService } from './esp.service';

@Module({
  imports: [HttpModule],
  controllers: [EspController],
  providers: [EspService],
})
export class EspModule {}

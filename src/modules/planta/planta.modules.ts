import { Module } from '@nestjs/common';
import { PlantaService } from './planta.service';
import { PlantaController } from './planta.controller';
import { RotinaModule } from '../rotina/rotina.modules';
import { DatabaseModule } from '../../database/database.module';
import { SensorModule } from '../sensor/sensor.modules';

@Module({
  imports: [DatabaseModule, RotinaModule, SensorModule],
  providers: [PlantaService],
  controllers: [PlantaController],
  exports: [PlantaService],
})
export class PlantaModule {}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlashMiddleware } from './common/middlewares/flash.middleware';
import { PlantaModule } from './modules/planta/planta.modules';
import { LoginModule } from './modules/login/login.modules';
import { WeatherModule } from './weather/weather.module';
import { SensorModule } from './modules/sensor/sensor.modules';
import { RotinaModule } from './modules/rotina/rotina.modules';
import { DatabaseModule } from './database/database.module';
import { LeituraModule } from './modules/leitura/leitura.module';
import { IrrigacaoModule } from './modules/irrigacao/irrigacao.module';
import { EspModule } from './modules/esp/esp.module';

@Module({
  imports: [
    DatabaseModule, 
    PlantaModule, 
    LoginModule, 
    WeatherModule, 
    SensorModule,
    RotinaModule,
    LeituraModule,
    IrrigacaoModule,
    EspModule
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FlashMiddleware).forRoutes('*');
  }
}

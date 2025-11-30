import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getTitulo(): string {
    return 'Meu Primeiro App Web';
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LeituraSensor } from './leitura.entity';

@Injectable()
export class LeituraService {
  constructor(
    @Inject('LEITURA_REPOSITORY')
    private repo: Repository<LeituraSensor>,
  ) {}

  async listarTodas() {
    return await this.repo.find({
      order: { dt_leitura: 'DESC' },
    });
  }
}

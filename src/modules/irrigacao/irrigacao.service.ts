import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Irrigacao } from './irrigacao.entity';

@Injectable()
export class IrrigacaoService {
  constructor(
    @Inject('IRRIGACAO_REPOSITORY')
    private repo: Repository<Irrigacao>,
  ) {}

  async listarTodas() {
    return this.repo.find({
      order: { dt_inicial: 'DESC' },
      relations: ['leituraSensor'],
    });
  }

  async criar(data: Partial<Irrigacao>) {
    const irrigacao = this.repo.create(data);
    return this.repo.save(irrigacao);
  }

    async statusAtual() {
        const [ultimo] = await this.repo.find({
            order: { dt_inicial: 'DESC' },
            take: 1,
        });
        return ultimo || null;
    }

}

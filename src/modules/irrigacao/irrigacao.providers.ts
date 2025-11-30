import { DataSource } from 'typeorm';
import { Irrigacao } from './irrigacao.entity';

export const irrigacaoProviders = [
  {
    provide: 'IRRIGACAO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Irrigacao),
    inject: ['DATA_SOURCE'],
  },
];

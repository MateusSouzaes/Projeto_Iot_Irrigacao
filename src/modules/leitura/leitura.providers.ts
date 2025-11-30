import { DataSource } from 'typeorm';
import { LeituraSensor } from './leitura.entity';

export const leituraProviders = [
  {
    provide: 'LEITURA_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(LeituraSensor),
    inject: ['DATA_SOURCE'],
  },
];

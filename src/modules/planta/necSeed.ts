import { DataSource } from 'typeorm';
import { NecessidadeHidrica } from './necHidrica.entity';
import { Planta } from './planta.entity';
import { Rotina } from '../rotina/rotina.entity';
import { Sensor } from '../sensor/sensor.entity';
import { TipoSensor } from '../sensor/tipoSensor.entity';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'irrigaPW2',
  entities: [Planta, Sensor, NecessidadeHidrica, Rotina, TipoSensor],
  synchronize: false,
});


async function seedNecessidadeHidrica() {
  try {
    await AppDataSource.initialize();

    const repo = AppDataSource.getRepository(NecessidadeHidrica);

    const precadastradas = [
      { nome: 'Muito Baixa', qtdLitro: 0.5 },
      { nome: 'Baixa', qtdLitro: 1 },
      { nome: 'Média', qtdLitro: 1.5 },
      { nome: 'Alta', qtdLitro: 2 },
      { nome: 'Muito Alta', qtdLitro: 2.5 },
    ];

    for (const item of precadastradas) {
      const existe = await repo.findOne({ where: { nome: item.nome } });
      if (!existe) {
        await repo.save(repo.create(item));
      }
    }

    console.log('Seed de Necessidade Hídrica finalizado!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedNecessidadeHidrica();

import { DataSource } from 'typeorm';
import { TipoSensor } from './tipoSensor.entity';
import { Sensor } from './sensor.entity';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'irrigaPW2',
  entities: [TipoSensor, Sensor],
  synchronize: false, 
});


async function seedTipoSensor() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(TipoSensor);

    const tipos = [
  { nome: 'Umidade do Solo', unidade_medida: '%' },
  { nome: 'Chuva', unidade_medida: 'mm' },
];


    for (const tipo of tipos) {
      const existe = await repo.findOne({ where: { nome: tipo.nome } });
      if (!existe) {
        await repo.save(repo.create(tipo));
      }
    }

    console.log('Seed de Tipo de Sensor finalizado!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedTipoSensor();

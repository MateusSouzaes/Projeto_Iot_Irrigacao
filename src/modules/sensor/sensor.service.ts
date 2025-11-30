import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Sensor } from './sensor.entity';
import { TipoSensor } from './tipoSensor.entity';

@Injectable()
export class SensorService {
  private sensorRepo: Repository<Sensor>;
  private tipoSensorRepo: Repository<TipoSensor>;

  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {
    this.sensorRepo = this.dataSource.getRepository(Sensor);
    this.tipoSensorRepo = this.dataSource.getRepository(TipoSensor);
  }

  async listar(): Promise<Sensor[]> {
    return this.sensorRepo.find({ relations: ['tipoSensor'] });
  }

  async listarTipos(): Promise<TipoSensor[]> {
    return this.tipoSensorRepo.find();
  }

  async criar(dados: { nome: string; localizacao: string; tipoSensorId: number; status: boolean }) {
    const tipoSensor = await this.tipoSensorRepo.findOne({ where: { id: dados.tipoSensorId } });

    if (!tipoSensor) throw new Error('Tipo de Sensor não encontrado');

    const sensor = this.sensorRepo.create({
      nome: dados.nome,
      localizacao: dados.localizacao,
      tipoSensor,
      status: dados.status, // agora usa o valor booleano passado
    });

    return this.sensorRepo.save(sensor);
  }

  async buscarPorId(id: number): Promise<Sensor | null> {
    return this.sensorRepo.findOne({
      where: { id },
      relations: ['tipoSensor'],
    });
  }

  async atualizar(
    id: number,
    dados: { nome: string; localizacao: string; tipoSensorId: number; status: boolean }
  ): Promise<Sensor> {
    const tipoSensor = await this.tipoSensorRepo.findOne({ where: { id: dados.tipoSensorId } });

    if (!tipoSensor) throw new Error('Tipo de Sensor não encontrado');

    await this.sensorRepo.update(id, {
      nome: dados.nome,
      localizacao: dados.localizacao,
      tipoSensor,
      status: dados.status, 
    });

    return this.buscarPorId(id) as Promise<Sensor>;
  }

  async excluir(id: number): Promise<void> {
    await this.sensorRepo.delete(id);
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Planta } from './planta.entity';
import { Rotina } from '../rotina/rotina.entity';
import { NecessidadeHidrica } from './necHidrica.entity';
import { Sensor } from '../sensor/sensor.entity';

@Injectable()
export class PlantaService {
  private plantaRepo: Repository<Planta>;
  private rotinaRepo: Repository<Rotina>;
  private necessidadeRepo: Repository<NecessidadeHidrica>;
  private sensorRepo: Repository<Sensor>;

  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {
    this.plantaRepo = this.dataSource.getRepository(Planta);
    this.rotinaRepo = this.dataSource.getRepository(Rotina);
    this.necessidadeRepo = this.dataSource.getRepository(NecessidadeHidrica);
    this.sensorRepo = this.dataSource.getRepository(Sensor);
  }

  async listar(): Promise<Planta[]> {
    return this.plantaRepo.find({ relations: ['rotina', 'necessidade_hidrica', 'sensor', 'sensor.tipoSensor'] });
  }

  async listarRotinas(): Promise<Rotina[]> {
    return this.rotinaRepo.find();
  }

  async listarNecessidades(): Promise<NecessidadeHidrica[]> {
    return this.necessidadeRepo.find();
  }

  async listarSensores(): Promise<Sensor[]> {
    return this.sensorRepo.find({ relations: ['tipoSensor'] });
  }

    async listarUltimas(limit: number) {
    return await this.plantaRepo.find({
      order: { id: 'DESC' },
      take: limit,
      relations: ['rotina', 'necessidade_hidrica', 'sensor'],
    });
  }


  async criar(dados: { nome: string; rotinaId: number; necessidadeId: number; sensorId: number }) {
    const rotina = await this.rotinaRepo.findOne({ where: { id: dados.rotinaId } });
    const necessidade = await this.necessidadeRepo.findOne({ where: { id: dados.necessidadeId } });
    const sensor = await this.sensorRepo.findOne({ where: { id: dados.sensorId } });

    if (!rotina || !necessidade || !sensor) throw new Error('Rotina, Necessidade ou Sensor não encontrados');

    const planta = this.plantaRepo.create({
      nome: dados.nome,
      rotina,
      necessidade_hidrica: necessidade,
      sensor,
    });

    return this.plantaRepo.save(planta);
  }

  async buscarPorId(id: number): Promise<Planta | null> {
    return this.plantaRepo.findOne({ 
      where: { id }, 
      relations: ['rotina', 'necessidade_hidrica', 'sensor', 'sensor.tipoSensor'] 
    });
  }

  async atualizar(
    id: number,
    dados: { nome: string; rotinaId: number; necessidadeId: number; sensorId: number }
  ): Promise<Planta> {
    const rotina = await this.rotinaRepo.findOne({ where: { id: dados.rotinaId } });
    const necessidade = await this.necessidadeRepo.findOne({ where: { id: dados.necessidadeId } });
    const sensor = await this.sensorRepo.findOne({ where: { id: dados.sensorId } });

    if (!rotina || !necessidade || !sensor) throw new Error('Rotina, Necessidade ou Sensor não encontrados');

    await this.plantaRepo.update(id, {
      nome: dados.nome,
      rotina,
      necessidade_hidrica: necessidade,
      sensor,
    });

    return this.buscarPorId(id) as Promise<Planta>;
  }

  async excluir(id: number): Promise<void> {
    await this.plantaRepo.delete(id);
  }
}

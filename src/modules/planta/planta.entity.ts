import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rotina } from '../rotina/rotina.entity';
import { NecessidadeHidrica } from './necHidrica.entity';
import { Sensor } from '../sensor/sensor.entity';

@Entity('plantas')
export class Planta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @ManyToOne(() => NecessidadeHidrica)
  @JoinColumn({ name: 'necessidade_hidrica_id' })
  necessidade_hidrica: NecessidadeHidrica;

  @ManyToOne(() => Rotina, rotina => rotina.plantas)
  @JoinColumn({ name: 'rotina_id' })
  rotina: Rotina;

  @ManyToOne(() => Sensor)   // nova relação
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;
}
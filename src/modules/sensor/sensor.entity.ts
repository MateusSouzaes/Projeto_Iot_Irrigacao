import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TipoSensor } from './tipoSensor.entity';

@Entity('sensor')
export class Sensor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  localizacao: string;

  @Column({ default: true })
  status: boolean; 

  @ManyToOne(() => TipoSensor, (tipoSensor) => tipoSensor.sensores, { eager: true })
  @JoinColumn({ name: 'tipo_sensor_id' })
  tipoSensor: TipoSensor;
}

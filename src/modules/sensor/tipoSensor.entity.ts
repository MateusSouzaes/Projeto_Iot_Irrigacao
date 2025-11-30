import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity('tipo_sensor')
export class TipoSensor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  unidade_medida: string;

  @OneToMany(() => Sensor, (sensor) => sensor.tipoSensor)
  sensores: Sensor[];
}

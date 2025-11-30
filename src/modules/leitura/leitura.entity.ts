import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Irrigacao } from '../irrigacao/irrigacao.entity';

@Entity('Leitura_sensor')
export class LeituraSensor {
  @PrimaryGeneratedColumn({ name: 'id_leitura_sensor' })
  id_leitura_sensor: number;

  @Column({ type: 'datetime', name: 'dt_leitura' })
  dt_leitura: Date;

  @Column({ type: 'float', name: 'valor' })
  valor: number;

  @Column({ type: 'int', name: 'fk_Sensor_id', nullable: true })
  fk_Sensor_id: number;

  // relação 1:N com irrigacao
  @OneToMany(() => Irrigacao, irrigacao => irrigacao.leituraSensor)
  irrigacoes: Irrigacao[];
}

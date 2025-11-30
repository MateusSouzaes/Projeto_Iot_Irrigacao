import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LeituraSensor } from '../leitura/leitura.entity';

@Entity('Irrigacao')
export class Irrigacao {
  @PrimaryGeneratedColumn({ name: 'id_irrigacao' })
  id_irrigacao: number;

  @Column({ name: 'modo_irrigacao', type: 'varchar', length: 50 })
  modo_irrigacao: string;

  @Column({ name: 'consumo_hidrico', type: 'float', default: 0 })
  consumo_hidrico: number;

  @Column({ name: 'dt_inicial', type: 'datetime' })
  dt_inicial: Date;

  @Column({ name: 'dt_final', type: 'datetime', nullable: true })
  dt_final: Date | null;

  @Column({ name: 'fk_Api_id', type: 'int', nullable: true })
  fk_Api_id: number | null;

  // FK → Leitura_sensor
  @Column({ name: 'fk_Leitura_sensor_id', type: 'int', nullable: true })
  fk_Leitura_sensor_id: number | null;

  @ManyToOne(() => LeituraSensor, leitura => leitura.irrigacoes)
  @JoinColumn({ name: 'fk_Leitura_sensor_id' })
  leituraSensor: LeituraSensor;
}

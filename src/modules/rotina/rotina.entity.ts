import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Planta } from '../planta/planta.entity';

@Entity('rotinas')
export class Rotina extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  frequencia: string;

  @Column('simple-array')
  dias: string[];

  @Column('simple-array')
  horarios: string[];

  @Column()
  tipo_execucao: string;

  @OneToMany(() => Planta, planta => planta.rotina)
  plantas: Planta[];
}

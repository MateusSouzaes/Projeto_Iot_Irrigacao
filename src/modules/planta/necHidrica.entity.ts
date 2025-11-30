import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('necessidade_hidrica')
export class NecessidadeHidrica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column('float', { name: 'qtdLitro' })
  qtdLitro: number;
}

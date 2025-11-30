import { Injectable } from '@nestjs/common';
import { Rotina } from './rotina.entity';

@Injectable()
export class RotinaService {
  
  async getAll(): Promise<Rotina[]> {
    return await Rotina.find();
  }

  async getById(id: number): Promise<Rotina | null> {
    return await Rotina.findOneBy({ id });
  }

  async create(data: Partial<Rotina>): Promise<Rotina> {
const rotina = Rotina.create(data) as Rotina;
    return await rotina.save();
  }

 async update(id: number, data: Partial<Rotina>): Promise<Rotina | null> {
  const rotina = await this.getById(id);
  if (!rotina) return null;
  Object.assign(rotina, data);
  return await rotina.save() as Rotina;
}


  async delete(id: number): Promise<void> {
    const rotina = await this.getById(id);
    if (rotina) await rotina.remove();
  }
}

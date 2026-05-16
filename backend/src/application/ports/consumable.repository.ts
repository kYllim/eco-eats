import { Consumable } from '../../domain/entities/Consumable';

export interface ConsumableRepository {
  save(consumable: Consumable): Promise<void>;
  findById(id: string): Promise<Consumable | null>;
  findByIds(ids: string[]): Promise<Consumable[]>;
  findAll(): Promise<Consumable[]>;
  delete(id: string): Promise<void>;
}

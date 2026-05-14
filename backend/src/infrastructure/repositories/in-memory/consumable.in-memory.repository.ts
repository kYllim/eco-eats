import { Consumable } from '../../../domain/entities/Consumable';
import { ConsumableRepository } from '../../../application/ports/consumable.repository';

export class InMemoryConsumableRepository implements ConsumableRepository {
  private consumables: Consumable[] = [];

  public async save(consumable: Consumable): Promise<void> {
    const index = this.consumables.findIndex(consumable => consumable.id === consumable.id);
    if (index !== -1) {
      this.consumables[index] = consumable;
    } else {
      this.consumables.push(consumable);
    }
  }

  public async findById(id: string): Promise<Consumable | null> {
    return this.consumables.find(consumable => consumable.id === id) || null;
  }

  public async findByIds(ids: string[]): Promise<Consumable[]> {
    return this.consumables.filter(consumable => ids.includes(consumable.id));
  }

  public async findAll(): Promise<Consumable[]> {
    return [...this.consumables];
  }

  public async delete(id: string): Promise<void> {
    this.consumables = this.consumables.filter(consumable => consumable.id !== id);
  }
}
import { Consumable } from '../../../domain/entities/Consumable';
import { ConsumableRepository } from '../../../application/ports/consumable.repository';

export class InMemoryConsumableRepository implements ConsumableRepository {
  private consumables: Consumable[] = [];

  public async save(consumable: Consumable): Promise<void> {
    const index = this.consumables.findIndex(
      (item) => item.id === consumable.id,
    );
    if (index !== -1) {
      this.consumables[index] = consumable;
    } else {
      this.consumables.push(consumable);
    }
    await Promise.resolve();
  }

  public async findById(id: string): Promise<Consumable | null> {
    const result = this.consumables.find((item) => item.id === id) || null;
    return Promise.resolve(result);
  }

  public async findByIds(ids: string[]): Promise<Consumable[]> {
    const result = this.consumables.filter((item) => ids.includes(item.id));
    return Promise.resolve(result);
  }

  public async findAll(): Promise<Consumable[]> {
    return Promise.resolve([...this.consumables]);
  }

  public async delete(id: string): Promise<void> {
    this.consumables = this.consumables.filter((item) => item.id !== id);
    await Promise.resolve();
  }
}

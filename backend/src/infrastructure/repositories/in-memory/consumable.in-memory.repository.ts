import { Consumable } from '../../../domain/entities/Consumable';
import { ConsumableRepository } from '../../../application/ports/consumable.repository';

export class InMemoryConsumableRepository implements ConsumableRepository {
  private consumables: Consumable[] = [];

  public save(consumable: Consumable): Promise<void> {
    const index = this.consumables.findIndex((c) => c.id === consumable.id);
    if (index !== -1) {
      this.consumables[index] = consumable;
    } else {
      this.consumables.push(consumable);
    }
    return Promise.resolve();
  }

  public findById(id: string): Promise<Consumable | null> {
    return Promise.resolve(
      this.consumables.find((consumable) => consumable.id === id) || null,
    );
  }

  public findByIds(ids: string[]): Promise<Consumable[]> {
    return Promise.resolve(
      this.consumables.filter((consumable) => ids.includes(consumable.id)),
    );
  }

  public findAll(): Promise<Consumable[]> {
    return Promise.resolve([...this.consumables]);
  }

  public delete(id: string): Promise<void> {
    this.consumables = this.consumables.filter(
      (consumable) => consumable.id !== id,
    );
    return Promise.resolve();
  }
}

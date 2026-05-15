import { Courier } from '../../../domain/entities/Courier';
import type { ICourierRepository } from '../../../domain/ports/repositories';

export class InMemoryCourierRepository implements ICourierRepository {
  private readonly couriers: Map<string, Courier> = new Map();

  findById(id: string): Promise<Courier | null> {
    return Promise.resolve(this.couriers.get(id) ?? null);
  }

  findAvailable(): Promise<Courier[]> {
    return Promise.resolve(
      Array.from(this.couriers.values()).filter(
        (courier) => courier.status === 'AVAILABLE',
      ),
    );
  }

  save(courier: Courier): Promise<void> {
    this.couriers.set(courier.id, courier);
    return Promise.resolve();
  }
}

import { Courier } from '../../../domain/entities/Courier';
import type { ICourierRepository } from '../../../domain/ports/repositories';

export class InMemoryCourierRepository implements ICourierRepository {
  private readonly couriers: Map<string, Courier> = new Map();

  async findById(id: string): Promise<Courier | null> {
    return this.couriers.get(id) ?? null;
  }

  async findAvailable(): Promise<Courier[]> {
    return Array.from(this.couriers.values()).filter(
      (courier) => courier.status === 'AVAILABLE',
    );
  }

  async save(courier: Courier): Promise<void> {
    this.couriers.set(courier.id, courier);
  }
}

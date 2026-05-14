import { Delivery } from '../../../domain/entities/Delivery';
import type { IDeliveryRepository } from '../../../domain/ports/repositories';

export class InMemoryDeliveryRepository implements IDeliveryRepository {
  private readonly deliveries: Map<string, Delivery> = new Map();

  async findById(id: string): Promise<Delivery | null> {
    return this.deliveries.get(id) ?? null;
  }

  async findPending(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(
      (delivery) => delivery.status === 'PENDING',
    );
  }

  async save(delivery: Delivery): Promise<void> {
    this.deliveries.set(delivery.id, delivery);
  }
}
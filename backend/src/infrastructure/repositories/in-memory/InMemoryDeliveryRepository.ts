import { Delivery } from '../../../domain/entities/Delivery';
import type { IDeliveryRepository } from '../../../domain/ports/repositories';

export class InMemoryDeliveryRepository implements IDeliveryRepository {
  private readonly deliveries: Map<string, Delivery> = new Map();

  findById(id: string): Promise<Delivery | null> {
    return Promise.resolve(this.deliveries.get(id) ?? null);
  }

  findPending(): Promise<Delivery[]> {
    return Promise.resolve(
      Array.from(this.deliveries.values()).filter(
        (delivery) => delivery.status === 'PENDING',
      ),
    );
  }

  save(delivery: Delivery): Promise<void> {
    this.deliveries.set(delivery.id, delivery);
    return Promise.resolve();
  }
}

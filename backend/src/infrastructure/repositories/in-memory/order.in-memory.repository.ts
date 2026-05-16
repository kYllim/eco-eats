import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../application/ports/order.repository';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  public async save(order: Order): Promise<void> {
    const index = this.orders.findIndex((item) => item.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    } else {
      this.orders.push(order);
    }
    await Promise.resolve();
  }

  public async findById(id: string): Promise<Order | null> {
    const result = this.orders.find((item) => item.id === id) || null;
    return Promise.resolve(result);
  }

  public async findByClientId(clientId: string): Promise<Order[]> {
    const result = this.orders.filter((item) => item.clientId === clientId);
    return Promise.resolve(result);
  }

  public async findAllPending(): Promise<Order[]> {
    const result = this.orders.filter(
      (item) => item.status === OrderStatus.PENDING,
    );
    return Promise.resolve(result);
  }
}

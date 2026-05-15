import { Order } from '../../../domain/entities/Order';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';
import { OrderRepository } from '../../../application/ports/order.repository';

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  public save(order: Order): Promise<void> {
    const index = this.orders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    } else {
      this.orders.push(order);
    }
    return Promise.resolve();
  }

  public findById(id: string): Promise<Order | null> {
    return Promise.resolve(
      this.orders.find((order) => order.id === id) || null,
    );
  }

  public findByClientId(clientId: string): Promise<Order[]> {
    return Promise.resolve(
      this.orders.filter((order) => order.clientId === clientId),
    );
  }

  public findAllPending(): Promise<Order[]> {
    return Promise.resolve(
      this.orders.filter((order) => order.status === OrderStatus.PENDING),
    );
  }
}

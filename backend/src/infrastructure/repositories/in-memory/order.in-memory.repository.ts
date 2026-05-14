import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../application/ports/order.repository';

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  public async save(order: Order): Promise<void> {
    const index = this.orders.findIndex(order => order.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    } else {
      this.orders.push(order);
    }
  }

  public async findById(id: string): Promise<Order | null> {
    return this.orders.find(order => order.id === id) || null;
  }

  public async findByClientId(clientId: string): Promise<Order[]> {
    return this.orders.filter(order => order.clientId === clientId);
  }

  public async findAllPending(): Promise<Order[]> {
    return this.orders.filter(order => order.status === 'PENDING');
  }
}
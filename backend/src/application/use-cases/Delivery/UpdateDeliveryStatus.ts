import { OrderRepository } from '../../ports/order.repository';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

export class UpdateDeliveryStatus {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, newStatus: OrderStatus) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('COMMANDE_INEXISTANTE');
    }

    order.updateStatus(newStatus);

    await this.orderRepository.save(order);
    return order;
  }
}

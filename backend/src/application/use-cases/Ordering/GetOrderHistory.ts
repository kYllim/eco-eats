import { OrderRepository } from '../../ports/order.repository';

export class GetOrderHistory {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(clientId: string) {
    return await this.orderRepository.findByClientId(clientId);
  }
}

import { OrderRepository } from '../../ports/order.repository';

export class GetOrderDetails {
  constructor(private orderRepo: OrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Commande introuvable.');
    return order;
  }
}

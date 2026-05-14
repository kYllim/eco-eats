// src/application/usecases/Ordering/PayOrder.ts
import { OrderRepository } from '../../ports/order.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

export class PayOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly consumableRepository: ConsumableRepository
  ) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error("Commande introuvable");

    order.transitionTo(OrderStatus.PAID); 

    for (const item of order.items) {
      const consumable = await this.consumableRepository.findById(item.id);
      if (consumable) {
        consumable.reduceStock(1); 
        await this.consumableRepository.save(consumable);
      }
    }

    await this.orderRepository.save(order);
    
    return {
      invoiceId: `FACT-${Date.now()}-${order.id}`,
      total: order.calculateTotal(),
      client: order.clientId,
      items: order.items.map(item => ({ name: item.name, price: item.getFinalPrice().value }))
    };
  }
}
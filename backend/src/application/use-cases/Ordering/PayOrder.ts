import { OrderRepository } from '../../ports/order.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';
import { Result } from '../../../domain/shared/result';

interface PayOrderInvoice {
  invoiceId: string;
  total: number;
  client: string;
  items: Array<{
    name: string;
    price: number;
  }>;
}

export class PayOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly consumableRepository: ConsumableRepository,
  ) {}

  async execute(orderId: string): Promise<Result<PayOrderInvoice>> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) return Result.fail<PayOrderInvoice>('Commande introuvable');

      order.transitionTo(OrderStatus.PAID);

      for (const item of order.items) {
        const consumable = await this.consumableRepository.findById(item.id);
        if (consumable) {
          consumable.reduceStock(1);
          await this.consumableRepository.save(consumable);
        }
      }

      await this.orderRepository.save(order);

      const invoice: PayOrderInvoice = {
        invoiceId: `FACT-${Date.now()}-${order.id}`,
        total: order.calculateTotal(),
        client: order.clientId,
        items: order.items.map((item) => ({
          name: item.name,
          price: item.getFinalPrice().value,
        })),
      };

      return Result.ok(invoice);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail<PayOrderInvoice>(
        message ?? 'Erreur inconnue lors du paiement',
      );
    }
  }
}

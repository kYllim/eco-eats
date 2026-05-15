import { OrderRepository } from '../../ports/order.repository';
import { Result } from '../../../domain/shared/result';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

export class MarkReady {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<Result<unknown>> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) return Result.fail('ORDER_NOT_FOUND');

      if (order.status !== OrderStatus.ACCEPTED) {
        return Result.fail('ORDER_MUST_BE_ACCEPTED');
      }

      order.transitionTo(OrderStatus.READY);
      await this.orderRepository.save(order);
      return Result.ok(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(message ?? 'ERROR_MARKING_READY');
    }
  }
}

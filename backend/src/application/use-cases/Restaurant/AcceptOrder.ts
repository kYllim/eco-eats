import { OrderRepository } from '../../ports/order.repository';
import { Result } from '../../../domain/shared/result';

export class AcceptOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, minutes: number): Promise<Result<unknown>> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) return Result.fail('ORDER_NOT_FOUND');

      order.accept(minutes);
      await this.orderRepository.save(order);
      return Result.ok(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(message ?? 'ERROR_ACCEPTING_ORDER');
    }
  }
}

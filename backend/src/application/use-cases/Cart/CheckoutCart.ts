import { Result } from '../../../domain/shared/result';
import { CartRepository } from '../../ports/cart.repository';
import { CreateOrder } from '../Ordering/CreateOrder';
import { CreateOrderDTO } from '../../dto/create-order.dto';
import { Order } from '../../../domain/entities/Order';

export class CheckoutCart {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly createOrder: CreateOrder,
  ) {}

  async execute(
    clientId: string,
    clientLocation: { lat: number; lon: number },
  ): Promise<Result<Order>> {
    try {
      const cart = await this.cartRepository.findByClientId(clientId);
      if (!cart || cart.getItems().length === 0) {
        return Result.fail('CART_EMPTY');
      }

      const dto: CreateOrderDTO = {
        clientId,
        restaurantId: cart.restaurantId as string,
        itemIds: cart.getItems().map((i) => i.id),
        clientLocation: {
          latitude: clientLocation.lat,
          longitude: clientLocation.lon,
        },
      };

      const result = await this.createOrder.execute(dto);
      if (result.isFailure) return Result.fail(result.error ?? 'ORDER_FAILED');

      await this.cartRepository.clear(clientId);
      return Result.ok(result.getValue());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(message ?? 'UNKNOWN_ERROR');
    }
  }
}

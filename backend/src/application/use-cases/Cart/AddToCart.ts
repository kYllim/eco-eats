import { Result } from '../../../domain/shared/result';
import { Cart } from '../../../domain/entities/Cart';
import { CartRepository } from '../../ports/cart.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';

export class AddToCart {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly consumableRepository: ConsumableRepository,
  ) {}

  async execute(clientId: string, consumableId: string): Promise<Result<Cart>> {
    try {
      const item = await this.consumableRepository.findById(consumableId);
      if (!item) return Result.fail<Cart>('ITEM_NOT_FOUND');

      let cart = await this.cartRepository.findByClientId(clientId);
      if (!cart) {
        cart = new Cart(clientId);
      }

      if (cart.restaurantId && item.restaurantId !== cart.restaurantId) {
        return Result.fail<Cart>('CART_DIFFERENT_RESTAURANT');
      }

      cart.addItem(item);
      await this.cartRepository.save(cart);
      return Result.ok(cart);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail<Cart>(message ?? 'UNKNOWN_ERROR');
    }
  }
}

import { Cart } from '../../../domain/entities/Cart';
import { CartRepository } from '../../ports/cart.repository';

export class GetCart {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(clientId: string): Promise<Cart | null> {
    return this.cartRepository.findByClientId(clientId);
  }
}

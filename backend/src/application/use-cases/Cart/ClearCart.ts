import { CartRepository } from '../../ports/cart.repository';

export class ClearCart {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(clientId: string): Promise<void> {
    await this.cartRepository.clear(clientId);
  }
}

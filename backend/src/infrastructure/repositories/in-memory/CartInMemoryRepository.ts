import { Cart } from '../../../domain/entities/Cart';
import { CartRepository } from '../../../application/ports/cart.repository';

export class CartInMemoryRepository implements CartRepository {
  private readonly store: Map<string, Cart> = new Map();

  findByClientId(clientId: string): Promise<Cart | null> {
    return Promise.resolve(this.store.get(clientId) ?? null);
  }

  save(cart: Cart): Promise<void> {
    this.store.set(cart.clientId, cart);
    return Promise.resolve();
  }

  clear(clientId: string): Promise<void> {
    this.store.delete(clientId);
    return Promise.resolve();
  }
}

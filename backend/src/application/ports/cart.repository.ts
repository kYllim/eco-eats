import { Cart } from '../../domain/entities/Cart';

export interface CartRepository {
  findByClientId(clientId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  clear(clientId: string): Promise<void>;
}

export type CartRepositoryToken = symbol;

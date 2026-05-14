import { Order }  from '../../domain/entities/Order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByClientId(clientId: string): Promise<Order[]>;
  findAllPending(): Promise<Order[]>; // fonction pour le restaurateur
}
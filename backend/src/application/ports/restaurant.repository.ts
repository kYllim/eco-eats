import { Restaurant } from '../../domain/entities/Restaurant';

export interface RestaurantRepository {
  findById(id: string): Promise<Restaurant | null>;
  findAll(): Promise<Restaurant[]>;
  save(restaurant: Restaurant): Promise<void>;
}

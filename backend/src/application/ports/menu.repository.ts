import { Menu } from '../../domain/entities/Menu';

export interface MenuRepository {
  findByRestaurantId(restaurantId: string): Promise<Menu[]>;
  save(menu: Menu): Promise<void>;
}

import { Menu } from '../../../domain/entities/Menu';
import { MenuRepository } from '../../../application/ports/menu.repository';

export class InMemoryMenuRepository implements MenuRepository {
  private menus: Menu[] = [];

  public async save(menu: Menu): Promise<void> {
    const index = this.menus.findIndex((menu) => menu.id === menu.id);
    if (index !== -1) {
      this.menus[index] = menu;
    } else {
      this.menus.push(menu);
    }
  }

  public async findByRestaurantId(restaurantId: string): Promise<Menu[]> {
    return this.menus.filter((menu) => menu.restaurantId === restaurantId);
  }
}

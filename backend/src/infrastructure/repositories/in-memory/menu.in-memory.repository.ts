import { Menu } from '../../../domain/entities/Menu';
import { MenuRepository } from '../../../application/ports/menu.repository';

export class InMemoryMenuRepository implements MenuRepository {
  private menus: Menu[] = [];

  public save(menu: Menu): Promise<void> {
    const index = this.menus.findIndex((m) => m.id === menu.id);
    if (index !== -1) {
      this.menus[index] = menu;
    } else {
      this.menus.push(menu);
    }
    return Promise.resolve();
  }

  public findByRestaurantId(restaurantId: string): Promise<Menu[]> {
    return Promise.resolve(
      this.menus.filter((menu) => menu.restaurantId === restaurantId),
    );
  }
}

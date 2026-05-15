import { PrismaService } from '../../prisma.service';
import { Menu } from '../../../domain/entities/Menu';
import { MenuRepository } from '../../../application/ports/menu.repository';

export class PrismaMenuRepository implements MenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRestaurantId(restaurantId: string): Promise<Menu[]> {
    const rows = await this.prisma.menu.findMany({ where: { restaurantId } });
    return rows.map((r) => new Menu(r.id, r.restaurantId, r.title));
  }

  async save(menu: Menu): Promise<void> {
    await this.prisma.menu.upsert({
      where: { id: menu.id },
      update: { title: menu.name },
      create: {
        id: menu.id,
        restaurantId: menu.restaurantId,
        title: menu.name,
      },
    });
  }
}

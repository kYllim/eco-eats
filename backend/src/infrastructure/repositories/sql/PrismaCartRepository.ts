import { PrismaService } from '../../prisma.service';
import { Cart } from '../../../domain/entities/Cart';
import { CartRepository } from '../../../application/ports/cart.repository';
import { Consumable } from '../../../domain/entities/Consumable';
import { Price } from '../../../domain/value-objects/Price';

export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(clientId: string): Promise<Cart | null> {
    const row = await this.prisma.cart.findFirst({
      where: { userId: clientId },
    });
    if (!row) return null;

    const itemsIds = row.items ?? [];
    const consumableRows = await this.prisma.consumable.findMany({
      where: { id: { in: itemsIds } },
    });

    const items: Consumable[] = consumableRows.map(
      (r) =>
        new Consumable(
          r.id,
          r.name,
          r.description ?? '',
          [],
          new Price(r.price),
          '',
          '',
          r.restaurantId,
          r.stock,
          0,
        ),
    );

    const restaurantId = items.length > 0 ? items[0].restaurantId : null;
    const cart = new Cart(clientId, items, restaurantId);
    return cart;
  }

  async save(cart: Cart): Promise<void> {
    const items = cart.getItems().map((i) => i.id);
    await this.prisma.cart.upsert({
      where: { id: cart.clientId },
      update: { items },
      create: { id: cart.clientId, userId: cart.clientId, items },
    });
  }

  async clear(clientId: string): Promise<void> {
    await this.prisma.cart.deleteMany({ where: { userId: clientId } });
  }
}

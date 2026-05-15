import { PrismaService } from '../../prisma.service';
import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../application/ports/order.repository';
import { Consumable } from '../../../domain/entities/Consumable';
import { Price } from '../../../domain/value-objects/Price';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.id },
      update: {
        clientId: order.clientId,
        restaurantId: order.restaurantId,
        status: order.status,
        tipEur: order.tipAmount.value,
        totalEur: order.calculateTotal(),
        items: order.items.map((i) => i.id),
        clientLatitude: order.clientLocation.latitude,
        clientLongitude: order.clientLocation.longitude,
      },
      create: {
        id: order.id,
        clientId: order.clientId,
        restaurantId: order.restaurantId,
        status: order.status,
        tipEur: order.tipAmount.value,
        totalEur: order.calculateTotal(),
        items: order.items.map((i) => i.id),
        clientLatitude: order.clientLocation.latitude,
        clientLongitude: order.clientLocation.longitude,
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { id } });
    if (!row) return null;
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: row.restaurantId },
    });
    const itemsRows = await this.prisma.consumable.findMany({
      where: { id: { in: row.items ?? [] } },
    });

    const items: Consumable[] = itemsRows.map(
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

    const restaurantLocation = {
      latitude: restaurant?.latitude ?? 0,
      longitude: restaurant?.longitude ?? 0,
    };

    const clientLocation = {
      latitude: row.clientLatitude ?? 0,
      longitude: row.clientLongitude ?? 0,
    };

    const tip = new Price(row.tipEur ?? 0);
    const order = new Order(
      row.id,
      row.clientId,
      row.restaurantId,
      items,
      restaurantLocation,
      clientLocation,
      tip,
    );
    order.transitionTo(
      OrderStatus[row.status as keyof typeof OrderStatus] ??
        OrderStatus.PENDING,
    );
    return order;
  }

  async findByClientId(clientId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({ where: { clientId } });
    if (rows.length === 0) return [];

    const restaurantIds = Array.from(new Set(rows.map((r) => r.restaurantId)));
    const restaurants = await this.prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
    });

    const allItemIds = Array.from(new Set(rows.flatMap((r) => r.items ?? [])));
    const consumableRows = await this.prisma.consumable.findMany({
      where: { id: { in: allItemIds } },
    });

    return rows.map((orderRow) => {
      const restaurant = restaurants.find(
        (restaurantRow) => restaurantRow.id === orderRow.restaurantId,
      );
      const items = (orderRow.items ?? []).map((itemId) => {
        const consumableRow = consumableRows.find((row) => row.id === itemId)!;
        return new Consumable(
          consumableRow.id,
          consumableRow.name,
          consumableRow.description ?? '',
          [],
          new Price(consumableRow.price),
          '',
          '',
          orderRow.restaurantId,
          consumableRow.stock ?? 0,
          0,
        );
      });

      const restaurantLocation = {
        latitude: restaurant?.latitude ?? 0,
        longitude: restaurant?.longitude ?? 0,
      };

      const clientLocation = {
        latitude: orderRow.clientLatitude ?? 0,
        longitude: orderRow.clientLongitude ?? 0,
      };

      const tip = new Price(orderRow.tipEur ?? 0);
      const order = new Order(
        orderRow.id,
        orderRow.clientId,
        orderRow.restaurantId,
        items,
        restaurantLocation,
        clientLocation,
        tip,
      );
      order.transitionTo(
        OrderStatus[orderRow.status as keyof typeof OrderStatus] ??
          OrderStatus.PENDING,
      );
      return order;
    });
  }

  async findAllPending(): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { status: 'PENDING' },
    });
    if (rows.length === 0) return [];

    const restaurantIds = Array.from(new Set(rows.map((r) => r.restaurantId)));
    const restaurants = await this.prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
    });

    const allItemIds = Array.from(new Set(rows.flatMap((r) => r.items ?? [])));
    const consumableRows = await this.prisma.consumable.findMany({
      where: { id: { in: allItemIds } },
    });

    return rows.map((r) => {
      const restaurant = restaurants.find((x) => x.id === r.restaurantId);
      const items = (r.items ?? []).map((id) => {
        const cr = consumableRows.find((x) => x.id === id)!;
        return new Consumable(
          cr.id,
          cr.name,
          cr.description ?? '',
          [],
          new Price(cr.price),
          '',
          '',
          cr.restaurantId,
          cr.stock,
          0,
        );
      });

      const restaurantLocation = {
        latitude: restaurant?.latitude ?? 0,
        longitude: restaurant?.longitude ?? 0,
      };

      const clientLocation = {
        latitude: r.clientLatitude ?? 0,
        longitude: r.clientLongitude ?? 0,
      };

      const tip = new Price(r.tipEur ?? 0);
      const order = new Order(
        r.id,
        r.clientId,
        r.restaurantId,
        items,
        restaurantLocation,
        clientLocation,
        tip,
      );
      order.transitionTo(
        OrderStatus[r.status as keyof typeof OrderStatus] ??
          OrderStatus.PENDING,
      );
      return order;
    });
  }
}

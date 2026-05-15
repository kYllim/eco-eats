import { PrismaService } from '../../prisma.service';
import { Consumable } from '../../../domain/entities/Consumable';
import { ConsumableRepository } from '../../../application/ports/consumable.repository';
import { Price } from '../../../domain/value-objects/Price';

export class PrismaConsumableRepository implements ConsumableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(consumable: Consumable): Promise<void> {
    await this.prisma.consumable.upsert({
      where: { id: consumable.id },
      update: {
        name: consumable.name,
        description: consumable.description,
        price: consumable.getFinalPrice().value,
        stock: consumable.stock,
        restaurantId: consumable.restaurantId,
      },
      create: {
        id: consumable.id,
        name: consumable.name,
        description: consumable.description,
        price: consumable.getFinalPrice().value,
        stock: consumable.stock,
        restaurantId: consumable.restaurantId,
      },
    });
  }

  async findById(id: string): Promise<Consumable | null> {
    const row = await this.prisma.consumable.findUnique({ where: { id } });
    if (!row) return null;
    return new Consumable(
      row.id,
      row.name,
      row.description ?? '',
      [],
      new Price(row.price),
      '',
      '',
      row.restaurantId,
      row.stock,
      0,
    );
  }

  async findByIds(ids: string[]): Promise<Consumable[]> {
    const rows = await this.prisma.consumable.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(
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
  }

  async findAll(): Promise<Consumable[]> {
    const rows = await this.prisma.consumable.findMany();
    return rows.map(
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
  }

  async delete(id: string): Promise<void> {
    await this.prisma.consumable.delete({ where: { id } });
  }
}

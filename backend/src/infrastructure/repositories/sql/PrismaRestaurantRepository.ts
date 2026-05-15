import { PrismaClient } from '@prisma/client';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { RestaurantRepository } from '../../../application/ports/restaurant.repository';

export class PrismaRestaurantRepository implements RestaurantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(restaurant: Restaurant): Promise<void> {
    await this.prisma.restaurant.upsert({
      where: { id: restaurant.id },
      update: {
        name: restaurant.name,
        ownerId: restaurant.ownerId,
        latitude: restaurant.location.latitude,
        longitude: restaurant.location.longitude,
        isOpen: restaurant.isOpen,
      },
      create: {
        id: restaurant.id,
        ownerId: restaurant.ownerId,
        name: restaurant.name,
        latitude: restaurant.location.latitude,
        longitude: restaurant.location.longitude,
        isOpen: restaurant.isOpen,
      },
    });
  }

  async findById(id: string): Promise<Restaurant | null> {
    const row = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!row) return null;
    return new Restaurant(
      row.id,
      row.ownerId,
      row.name,
      { latitude: row.latitude, longitude: row.longitude },
      row.isOpen,
    );
  }

  async findAll(): Promise<Restaurant[]> {
    const rows = await this.prisma.restaurant.findMany();
    return rows.map(
      (r) =>
        new Restaurant(
          r.id,
          r.ownerId,
          r.name,
          { latitude: r.latitude, longitude: r.longitude },
          r.isOpen,
        ),
    );
  }
}

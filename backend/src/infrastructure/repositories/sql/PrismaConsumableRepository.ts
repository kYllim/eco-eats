import { PrismaService } from '../../prisma.service';
import type { IConsumableRepository } from '../../../domain/ports/repositories';

export class PrismaConsumableRepository implements IConsumableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(consumable: any): Promise<void> {
    await this.prisma.prismaConsumable.create({
      data: {
        id: consumable.id,
        restaurantId: consumable.restaurantId,
        name: consumable.name,
        description: consumable.description,
        price: consumable.price?.value ?? consumable.price,
        stock: consumable.stock,
        category: consumable.category,
        imageUrl: consumable.imageUrl,
        allergens: consumable.allergens ?? [],
      },
    });
  }

  async findById(id: string): Promise<any | null> {
    return await this.prisma.prismaConsumable.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any): Promise<any> {
    return await this.prisma.prismaConsumable.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price?.value ?? data.price,
        stock: data.stock,
        category: data.category,
        imageUrl: data.imageUrl,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.prismaConsumable.delete({
      where: { id },
    });
  }
}
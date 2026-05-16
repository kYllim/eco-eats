import { PrismaService } from '../../prisma.service';
import type { IRestaurantRepository } from '../../../domain/ports/repositories';

export class PrismaRestaurantRepository implements IRestaurantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any | null> {
    return await this.prisma.prismaRestaurant.findUnique({
      where: { id },
    });
  }
}

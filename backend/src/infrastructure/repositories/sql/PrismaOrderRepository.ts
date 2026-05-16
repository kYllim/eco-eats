import { PrismaService } from '../../prisma.service';
import type { IOrderRepository } from '../../../domain/ports/repositories';

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: any): Promise<void> {
    await this.prisma.prismaOrder.create({
      data: {
        id: order.id,
        clientId: order.clientId,
        restaurantId: order.restaurantId,
        status: order.status,
        pickupLatitude: order.pickupLatitude ?? 0.0,
        pickupLongitude: order.pickupLongitude ?? 0.0,
        dropoffLatitude: order.dropoffLatitude ?? 0.0,
        dropoffLongitude: order.dropoffLongitude ?? 0.0,
      },
    });
  }

  async findById(id: string): Promise<any | null> {
    return await this.prisma.prismaOrder.findUnique({
      where: { id },
    });
  }

  async findByClientId(clientId: string): Promise<any[]> {
    return await this.prisma.prismaOrder.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

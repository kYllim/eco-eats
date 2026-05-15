import { PrismaClient } from '@prisma/client';
import {
  Courier,
  CourierStatus,
  CourierTier,
} from '../../../domain/entities/Courier';
import { Wallet } from '../../../domain/value-objects/Wallet';
import type { ICourierRepository } from '../../../domain/ports/repositories';

interface CourierRow {
  id: string;
  name: string;
  status: string;
  tier: string;
  walletBalance: number;
  activeDeliveryIds: string[];
  currentRestaurantId: string | null;
}

export class PrismaCourierRepository implements ICourierRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Courier | null> {
    const row = await this.prisma.courier.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAvailable(): Promise<Courier[]> {
    const rows = await this.prisma.courier.findMany({
      where: { status: 'AVAILABLE' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(courier: Courier): Promise<void> {
    await this.prisma.courier.upsert({
      where: { id: courier.id },
      update: {
        status: courier.status,
        walletBalance: courier.wallet.balance,
        activeDeliveryIds: [...courier.activeDeliveryIds],
        currentRestaurantId: courier.currentRestaurantId,
      },
      create: {
        id: courier.id,
        name: courier.name,
        status: courier.status,
        tier: courier.tier,
        walletBalance: courier.wallet.balance,
        activeDeliveryIds: [...courier.activeDeliveryIds],
        currentRestaurantId: courier.currentRestaurantId,
      },
    });
  }

  private toDomain(row: CourierRow): Courier {
    return Courier.reconstitute({
      id: row.id,
      name: row.name,
      status: row.status as CourierStatus,
      tier: row.tier as CourierTier,
      wallet: Wallet.create(row.walletBalance),
      activeDeliveryIds: row.activeDeliveryIds,
      currentRestaurantId: row.currentRestaurantId,
    });
  }
}

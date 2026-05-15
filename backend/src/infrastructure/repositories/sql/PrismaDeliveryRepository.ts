import { PrismaClient } from '@prisma/client';
import { Delivery, DeliveryStatus } from '../../../domain/entities/Delivery';
import { Location } from '../../../domain/value-objects/Location';
import type { IDeliveryRepository } from '../../../domain/ports/repositories';

interface DeliveryRow {
  id: string;
  orderId: string;
  restaurantId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  distanceKm: number;
  tipEur: number;
  status: string;
  courierId: string | null;
}

export class PrismaDeliveryRepository implements IDeliveryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.prisma.delivery.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findPending(): Promise<Delivery[]> {
    const rows = await this.prisma.delivery.findMany({
      where: { status: 'PENDING' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(delivery: Delivery): Promise<void> {
    await this.prisma.delivery.upsert({
      where: { id: delivery.id },
      update: {
        status: delivery.status,
        courierId: delivery.courierId,
      },
      create: {
        id: delivery.id,
        orderId: delivery.orderId,
        restaurantId: delivery.restaurantId,
        pickupLatitude: delivery.pickupLocation.latitude,
        pickupLongitude: delivery.pickupLocation.longitude,
        dropoffLatitude: delivery.dropoffLocation.latitude,
        dropoffLongitude: delivery.dropoffLocation.longitude,
        distanceKm: delivery.distanceKm,
        tipEur: delivery.tipEur,
        status: delivery.status,
        courierId: delivery.courierId,
      },
    });
  }

  private toDomain(row: DeliveryRow): Delivery {
    return Delivery.reconstitute({
      id: row.id,
      orderId: row.orderId,
      restaurantId: row.restaurantId,
      pickupLocation: Location.create(row.pickupLatitude, row.pickupLongitude),
      dropoffLocation: Location.create(
        row.dropoffLatitude,
        row.dropoffLongitude,
      ),
      distanceKm: row.distanceKm,
      tipEur: row.tipEur,
      status: row.status as DeliveryStatus,
      courierId: row.courierId,
    });
  }
}

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaCourierRepository } from './repositories/sql/PrismaCourierRepository';
import { PrismaDeliveryRepository } from './repositories/sql/PrismaDeliveryRepository';
import { PrismaMessageRepository } from './repositories/sql/PrismaMessageRepository';
import { PrismaConsumableRepository } from './repositories/sql/PrismaConsumableRepository';
import { PrismaRestaurantRepository } from './repositories/sql/PrismaRestaurantRepository';
import { PrismaOrderRepository } from './repositories/sql/PrismaOrderRepository';

import {
  COURIER_REPOSITORY,
  DELIVERY_REPOSITORY,
  MESSAGE_REPOSITORY,
  CONSUMABLE_REPOSITORY,
  RESTAURANT_REPOSITORY,
  ORDER_REPOSITORY,
} from '../domain/ports/tokens';

@Module({
  providers: [
    PrismaService,
    {
      provide: COURIER_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourierRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: DELIVERY_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaDeliveryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: MESSAGE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaMessageRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CONSUMABLE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaConsumableRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: RESTAURANT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaRestaurantRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: ORDER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrderRepository(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [
    COURIER_REPOSITORY,
    DELIVERY_REPOSITORY,
    MESSAGE_REPOSITORY,
    CONSUMABLE_REPOSITORY,
    RESTAURANT_REPOSITORY,
    ORDER_REPOSITORY,
  ],
})
export class InfrastructureModule {}

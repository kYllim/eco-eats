import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaCourierRepository } from './repositories/sql/PrismaCourierRepository';
import { PrismaDeliveryRepository } from './repositories/sql/PrismaDeliveryRepository';
import { PrismaMessageRepository } from './repositories/sql/PrismaMessageRepository';
import { PrismaRestaurantRepository } from './repositories/sql/PrismaRestaurantRepository';
import { PrismaConsumableRepository } from './repositories/sql/PrismaConsumableRepository';
import { PrismaOrderRepository } from './repositories/sql/PrismaOrderRepository';
import { PrismaMenuRepository } from './repositories/sql/PrismaMenuRepository';
import { PrismaUserRepository } from './repositories/sql/PrismaUserRepository';
import {
  COURIER_REPOSITORY,
  DELIVERY_REPOSITORY,
  MESSAGE_REPOSITORY,
  RESTAURANT_REPOSITORY,
  CONSUMABLE_REPOSITORY,
  ORDER_REPOSITORY,
  MENU_REPOSITORY,
  USER_REPOSITORY,
  CART_REPOSITORY,
} from '../domain/ports/tokens';
import { CartInMemoryRepository } from './repositories/in-memory/CartInMemoryRepository';

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
      provide: RESTAURANT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaRestaurantRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CONSUMABLE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaConsumableRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: ORDER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrderRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: MENU_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaMenuRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: USER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CART_REPOSITORY,
      useClass: CartInMemoryRepository,
    },
  ],
  exports: [
    COURIER_REPOSITORY,
    DELIVERY_REPOSITORY,
    MESSAGE_REPOSITORY,
    RESTAURANT_REPOSITORY,
    CONSUMABLE_REPOSITORY,
    ORDER_REPOSITORY,
    MENU_REPOSITORY,
    USER_REPOSITORY,
    CART_REPOSITORY,
  ],
})
export class InfrastructureModule {}

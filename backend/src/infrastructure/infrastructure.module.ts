import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaCourierRepository } from './repositories/sql/PrismaCourierRepository';
import { PrismaDeliveryRepository } from './repositories/sql/PrismaDeliveryRepository';
import { PrismaMessageRepository } from './repositories/sql/PrismaMessageRepository';
import {
  COURIER_REPOSITORY,
  DELIVERY_REPOSITORY,
  MESSAGE_REPOSITORY,
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
  ],
  exports: [COURIER_REPOSITORY, DELIVERY_REPOSITORY, MESSAGE_REPOSITORY],
})
export class InfrastructureModule {}
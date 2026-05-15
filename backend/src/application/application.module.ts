import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AssignDelivery } from './use-cases/AssignDelivery';
import { CompleteDelivery } from './use-cases/CompleteDelivery';
import { SendMessage } from './use-cases/SendMessage';
import { CreateRestaurant } from './use-cases/CreateRestaurant';
import type {
  ICourierRepository,
  IDeliveryRepository,
  IMessageRepository,
} from '../domain/ports/repositories';
import type { RestaurantRepository } from './ports/restaurant.repository';
import {
  COURIER_REPOSITORY,
  DELIVERY_REPOSITORY,
  MESSAGE_REPOSITORY,
  RESTAURANT_REPOSITORY,
} from '../domain/ports/tokens';

@Module({
  imports: [InfrastructureModule],
  providers: [
    {
      provide: AssignDelivery,
      useFactory: (
        courierRepo: ICourierRepository,
        deliveryRepo: IDeliveryRepository,
      ) => new AssignDelivery(courierRepo, deliveryRepo),
      inject: [COURIER_REPOSITORY, DELIVERY_REPOSITORY],
    },
    {
      provide: CompleteDelivery,
      useFactory: (
        courierRepo: ICourierRepository,
        deliveryRepo: IDeliveryRepository,
      ) => new CompleteDelivery(courierRepo, deliveryRepo),
      inject: [COURIER_REPOSITORY, DELIVERY_REPOSITORY],
    },
    {
      provide: SendMessage,
      useFactory: (messageRepo: IMessageRepository) =>
        new SendMessage(messageRepo),
      inject: [MESSAGE_REPOSITORY],
    },
    {
      provide: CreateRestaurant,
      useFactory: (restaurantRepo: unknown) =>
        new CreateRestaurant(restaurantRepo as RestaurantRepository),
      inject: [RESTAURANT_REPOSITORY],
    },
  ],
  exports: [AssignDelivery, CompleteDelivery, SendMessage, CreateRestaurant],
})
export class ApplicationModule {}

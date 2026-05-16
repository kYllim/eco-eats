import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

// Use-cases existants (Livraison & Chat)
import { AssignDelivery } from './use-cases/AssignDelivery';
import { CompleteDelivery } from './use-cases/CompleteDelivery';
import { SendMessage } from './use-cases/SendMessage';

// 💡 Tes Use-cases à ajouter (Menu / Consumable)
import { AddConsumable } from './usecases/Consumable/AddConsumable';
import { GetConsumable } from './usecases/Consumable/GetConsumable';
import { UpdateConsumable } from './usecases/Consumable/UpdateConsumable';
import { RemoveConsumable } from './usecases/Consumable/RemoveConsumable';

// 💡 Tes Use-cases à ajouter (Ordering / Commandes)
import { CreateOrder } from './usecases/Ordering/CreateOrder';
import { PayOrder } from './usecases/Ordering/PayOrder';
import { GetOrderDetails } from './usecases/Ordering/GetOrderDetails';
import { GetOrderHistory } from './usecases/Ordering/GetOrderHistory';

// Interfaces des ports
import type {
  ICourierRepository,
  IDeliveryRepository,
  IMessageRepository,
  IConsumableRepository,
  IRestaurantRepository,
  IOrderRepository,
} from '../domain/ports/repositories';

import {
  COURIER_REPOSITORY,
  DELIVERY_REPOSITORY,
  MESSAGE_REPOSITORY,
  CONSUMABLE_REPOSITORY,
  RESTAURANT_REPOSITORY,
  ORDER_REPOSITORY,
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
      provide: AddConsumable,
      useFactory: (
        consumableRepo: IConsumableRepository,
        restaurantRepo: IRestaurantRepository,
      ) => new (AddConsumable as any)(consumableRepo, restaurantRepo),
      inject: [CONSUMABLE_REPOSITORY, RESTAURANT_REPOSITORY],
    },
    {
      provide: GetConsumable,
      useFactory: (consumableRepo: IConsumableRepository) =>
        new (GetConsumable as any)(consumableRepo),
      inject: [CONSUMABLE_REPOSITORY],
    },
    {
      provide: UpdateConsumable,
      useFactory: (consumableRepo: IConsumableRepository) =>
        new (UpdateConsumable as any)(consumableRepo),
      inject: [CONSUMABLE_REPOSITORY],
    },
    {
      provide: RemoveConsumable,
      useFactory: (consumableRepo: IConsumableRepository) =>
        new (RemoveConsumable as any)(consumableRepo),
      inject: [CONSUMABLE_REPOSITORY],
    },

    // --- ORDERING / COMMANDES (Corrigés avec les bons arguments) ---
    {
      provide: CreateOrder,
      useFactory: (
        orderRepo: IOrderRepository,
        restaurantRepo: IRestaurantRepository,
        consumableRepo: IConsumableRepository,
      ) =>
        Reflect.construct(CreateOrder, [
          orderRepo,
          restaurantRepo,
          consumableRepo,
        ]), // 💡 Reçoit les 3 arguments attendus
      inject: [ORDER_REPOSITORY, RESTAURANT_REPOSITORY, CONSUMABLE_REPOSITORY],
    },
    {
      provide: PayOrder,
      useFactory: (
        orderRepo: IOrderRepository,
        consumableRepo: IConsumableRepository,
      ) => Reflect.construct(PayOrder, [orderRepo, consumableRepo]), // 💡 Reçoit les 2 arguments attendus
      inject: [ORDER_REPOSITORY, CONSUMABLE_REPOSITORY],
    },
    {
      provide: GetOrderDetails,
      useFactory: (orderRepo: IOrderRepository) =>
        new (GetOrderDetails as any)(orderRepo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: GetOrderHistory,
      useFactory: (orderRepo: IOrderRepository) =>
        new (GetOrderHistory as any)(orderRepo),
      inject: [ORDER_REPOSITORY],
    },
  ],
  exports: [
    AssignDelivery,
    CompleteDelivery,
    SendMessage,
    AddConsumable,
    GetConsumable,
    UpdateConsumable,
    RemoveConsumable,
    CreateOrder,
    PayOrder,
    GetOrderDetails,
    GetOrderHistory,
  ],
})
export class ApplicationModule {}

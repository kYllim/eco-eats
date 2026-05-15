import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CourierController } from '../controllers/nest/Courier.controller';
import { MessageController } from '../controllers/nest/Message.controller';
import { RestaurantController } from '../controllers/nest/Restaurant.controller';
import { CartController } from '../controllers/nest/Cart.controller';
import { OrderingController } from '../controllers/nest/Ordering.controller';
import { MenuController } from '../controllers/nest/Menu.controller';
import { DeliveryController } from '../controllers/nest/Delivery.controller';

@Module({
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [
    CourierController,
    MessageController,
    RestaurantController,
    CartController,
    OrderingController,
    MenuController,
    DeliveryController,
  ],
})
export class HttpModule {}

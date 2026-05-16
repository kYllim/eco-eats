import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CourierController } from './controllers/Courier.controller';
import { MessageController } from './controllers/Message.controller';
import { FeedController } from './controllers/feed.controller';
import { MenuController } from './controllers/menu.controller';
import { OrderingController } from './controllers/ordering.controller';

@Module({
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [
    CourierController,
    MessageController,
    FeedController,
    MenuController,
    OrderingController,
  ],
})
export class HttpModule {}

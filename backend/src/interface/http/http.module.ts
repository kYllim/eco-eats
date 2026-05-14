import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CourierController } from './controllers/Courier.controller';
import { MessageController } from './controllers/Message.controller';

@Module({
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [CourierController, MessageController],
})
export class HttpModule {}
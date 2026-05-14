import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { PrivateChatGateway } from './gateways/PrivateChat.gateway';
import { GroupChatGateway } from './gateways/GroupChat.gateway';

@Module({
  imports: [ApplicationModule, InfrastructureModule],
  providers: [PrivateChatGateway, GroupChatGateway],
})
export class WebsocketModule {}

import { Inject, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { SendMessage } from '../../../application/use-cases/SendMessage';
import type { IMessageRepository } from '../../../domain/ports/repositories';
import { MESSAGE_REPOSITORY } from '../../../domain/ports/tokens';

const STAFF_ROOM = 'staff-room';

type UserRole = 'MODERATOR' | 'ADMIN';

interface GroupMessagePayload {
  content: string;
}

@WebSocketGateway({
  namespace: '/group',
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class GroupChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GroupChatGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly sendMessage: SendMessage,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const userId = this.userId(client);
    const role = this.role(client);
    if (!userId || !role) {
      client.disconnect();
      return;
    }
    await client.join(STAFF_ROOM);
    this.logger.log(`staff joined user=${userId} role=${role}`);

    const messages = await this.messageRepository.findGroupHistory(STAFF_ROOM);
    client.emit(
      'history',
      messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        sentAt: m.sentAt,
      })),
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`staff left user=${this.userId(client)}`);
  }

  @SubscribeMessage('send_group_message')
  async onGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GroupMessagePayload,
  ): Promise<void> {
    const userId = this.userId(client);
    const role = this.role(client);
    if (!userId || !role) return;
    if (!payload?.content?.trim()) {
      client.emit('error', { message: 'content requis.' });
      return;
    }

    try {
      const message = await this.sendMessage.execute({
        id: randomUUID(),
        senderId: userId,
        roomId: STAFF_ROOM,
        content: payload.content,
        type: 'GROUP',
      });

      this.server.to(STAFF_ROOM).emit('group_message', {
        id: message.id,
        senderId: message.senderId,
        role,
        content: message.content,
        sentAt: message.sentAt,
      });
    } catch (error) {
      this.logger.error((error as Error).message);
      client.emit('error', { message: (error as Error).message });
    }
  }

  @SubscribeMessage('typing')
  onTyping(@ConnectedSocket() client: Socket): void {
    const userId = this.userId(client);
    const role = this.role(client);
    if (!userId) return;
    client.to(STAFF_ROOM).emit('user_typing', { userId, role });
  }

  @SubscribeMessage('stop_typing')
  onStopTyping(@ConnectedSocket() client: Socket): void {
    const userId = this.userId(client);
    if (!userId) return;
    client.to(STAFF_ROOM).emit('user_stop_typing', { userId });
  }

  private userId(client: Socket): string | undefined {
    const queriedUserId = client.handshake.query.userId;
    return typeof queriedUserId === 'string' && queriedUserId.length > 0
      ? queriedUserId
      : undefined;
  }

  private role(client: Socket): UserRole | undefined {
    const roleValue = client.handshake.query.role;
    if (roleValue === 'MODERATOR' || roleValue === 'ADMIN') return roleValue;
    return undefined;
  }
}

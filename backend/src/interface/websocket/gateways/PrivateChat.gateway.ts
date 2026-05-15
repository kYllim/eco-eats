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

interface PrivateMessagePayload {
  receiverId: string;
  content: string;
}

interface TypingPayload {
  receiverId: string;
}

@WebSocketGateway({
  namespace: '/private',
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class PrivateChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PrivateChatGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly sendMessage: SendMessage,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const userId = this.userId(client);
    if (!userId) {
      client.disconnect();
      return;
    }
    await client.join(userId);
    this.logger.log(`connected user=${userId} socket=${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(
      `disconnected user=${this.userId(client)} socket=${client.id}`,
    );
  }

  @SubscribeMessage('history')
  async onHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { peerId: string },
  ): Promise<void> {
    const userId = this.userId(client);
    if (!userId || !payload?.peerId) return;
    const messages = await this.messageRepository.findPrivateHistory(
      userId,
      payload.peerId,
    );
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

  @SubscribeMessage('send_private_message')
  async onPrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PrivateMessagePayload,
  ): Promise<void> {
    const senderId = this.userId(client);
    if (!senderId) return;
    if (!payload?.receiverId || !payload?.content?.trim()) {
      client.emit('error', { message: 'receiverId et content sont requis.' });
      return;
    }

    try {
      const message = await this.sendMessage.execute({
        id: randomUUID(),
        senderId,
        receiverId: payload.receiverId,
        content: payload.content,
        type: 'PRIVATE',
      });

      const dto = {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        sentAt: message.sentAt,
      };

      this.server.to(senderId).emit('private_message', dto);
      this.server.to(payload.receiverId).emit('private_message', dto);
    } catch (error) {
      this.logger.error((error as Error).message);
      client.emit('error', { message: (error as Error).message });
    }
  }

  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const senderId = this.userId(client);
    if (!senderId || !payload?.receiverId) return;
    this.server.to(payload.receiverId).emit('user_typing', { senderId });
  }

  @SubscribeMessage('stop_typing')
  onStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const senderId = this.userId(client);
    if (!senderId || !payload?.receiverId) return;
    this.server.to(payload.receiverId).emit('user_stop_typing', { senderId });
  }

  private userId(client: Socket): string | null {
    const id = client.handshake.query.userId;
    return typeof id === 'string' && id.length > 0 ? id : null;
  }
}

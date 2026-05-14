import { Message } from '../../../domain/entities/Message';
import type { IMessageRepository } from '../../../domain/ports/repositories';

export class InMemoryMessageRepository implements IMessageRepository {
  private readonly messages: Message[] = [];

  async findPrivateHistory(
    userIdA: string,
    userIdB: string,
  ): Promise<Message[]> {
    return this.messages.filter(
      (message) =>
        message.type === 'PRIVATE' &&
        ((message.senderId === userIdA && message.receiverId === userIdB) ||
          (message.senderId === userIdB && message.receiverId === userIdA)),
    );
  }

  async findGroupHistory(roomId: string): Promise<Message[]> {
    return this.messages.filter(
      (message) =>
        message.type === 'GROUP' && message.roomId === roomId,
    );
  }

  async save(message: Message): Promise<void> {
    this.messages.push(message);
  }
}
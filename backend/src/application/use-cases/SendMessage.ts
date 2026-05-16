import type { IMessageRepository } from '../../domain/ports/repositories';
import { Message, MessageType } from '../../domain/entities/Message';

export interface SendMessageCommand {
  id: string;
  senderId: string;
  content: string;
  type: MessageType;
  receiverId?: string;
  roomId?: string;
}

export class SendMessage {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(command: SendMessageCommand): Promise<Message> {
    const message = this.buildMessage(command);
    await this.messageRepository.save(message);
    return message;
  }

  private buildMessage(command: SendMessageCommand): Message {
    if (command.type === 'PRIVATE') {
      if (!command.receiverId) {
        throw new Error('Un message privé nécessite un destinataire.');
      }
      return Message.createPrivate({
        id: command.id,
        senderId: command.senderId,
        receiverId: command.receiverId,
        content: command.content,
      });
    }

    if (!command.roomId) {
      throw new Error('Un message de groupe nécessite un salon.');
    }

    return Message.createGroupMessage({
      id: command.id,
      senderId: command.senderId,
      roomId: command.roomId,
      content: command.content,
    });
  }
}

import { PrismaClient } from '@prisma/client';
import { Message, MessageType } from '../../../domain/entities/Message';
import type { IMessageRepository } from '../../../domain/ports/repositories';

interface MessageRow {
  id: string;
  senderId: string;
  content: string;
  type: string;
  sentAt: Date;
  receiverId: string | null;
  roomId: string | null;
}

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPrivateHistory(
    userIdA: string,
    userIdB: string,
  ): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: {
        type: 'PRIVATE',
        OR: [
          { senderId: userIdA, receiverId: userIdB },
          { senderId: userIdB, receiverId: userIdA },
        ],
      },
      orderBy: { sentAt: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findGroupHistory(roomId: string): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where: { type: 'GROUP', roomId },
      orderBy: { sentAt: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(message: Message): Promise<void> {
    await this.prisma.message.create({
      data: {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        sentAt: message.sentAt,
        receiverId: message.receiverId,
        roomId: message.roomId,
      },
    });
  }

  private toDomain(row: MessageRow): Message {
    return Message.reconstitute({
      id: row.id,
      senderId: row.senderId,
      content: row.content,
      type: row.type as MessageType,
      sentAt: row.sentAt,
      receiverId: row.receiverId,
      roomId: row.roomId,
    });
  }
}

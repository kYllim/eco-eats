import {
  Controller,
  Get,
  Inject,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { IMessageRepository } from '../../../domain/ports/repositories';
import { MESSAGE_REPOSITORY } from '../../../domain/ports/tokens';
import { Message } from '../../../domain/entities/Message';

interface MessageDto {
  id: string;
  senderId: string;
  receiverId: string | null;
  roomId: string | null;
  content: string;
  type: string;
  sentAt: Date;
}

@Controller('messages')
export class MessageController {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  @Get('private')
  async getPrivateHistory(
    @Query('userIdA') userIdA?: string,
    @Query('userIdB') userIdB?: string,
  ): Promise<MessageDto[]> {
    if (!userIdA || !userIdB) {
      throw new BadRequestException('userIdA et userIdB sont requis.');
    }
    const messages = await this.messageRepository.findPrivateHistory(
      userIdA,
      userIdB,
    );
    return messages.map(toDto);
  }

  @Get('group')
  async getGroupHistory(
    @Query('roomId') roomId?: string,
  ): Promise<MessageDto[]> {
    if (!roomId) {
      throw new BadRequestException('roomId est requis.');
    }
    const messages = await this.messageRepository.findGroupHistory(roomId);
    return messages.map(toDto);
  }
}

function toDto(message: Message): MessageDto {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    roomId: message.roomId,
    content: message.content,
    type: message.type,
    sentAt: message.sentAt,
  };
}

export type MessageType = 'PRIVATE' | 'GROUP';

export class Message {
  private constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly type: MessageType,
    public readonly sentAt: Date,
    public readonly receiverId: string | null,
    public readonly roomId: string | null,
  ) {}

  static createPrivate(params: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
  }): Message {
    if (!params.content.trim()) {
      throw new Error('Le contenu du message ne peut pas être vide.');
    }
    return new Message(
      params.id,
      params.senderId,
      params.content,
      'PRIVATE',
      new Date(),
      params.receiverId,
      null,
    );
  }

  static createGroupMessage(params: {
    id: string;
    senderId: string;
    roomId: string;
    content: string;
  }): Message {
    if (!params.content.trim()) {
      throw new Error('Le contenu du message ne peut pas être vide.');
    }
    return new Message(
      params.id,
      params.senderId,
      params.content,
      'GROUP',
      new Date(),
      null,
      params.roomId,
    );
  }

  static reconstitute(params: {
    id: string;
    senderId: string;
    content: string;
    type: MessageType;
    sentAt: Date;
    receiverId: string | null;
    roomId: string | null;
  }): Message {
    return new Message(
      params.id,
      params.senderId,
      params.content,
      params.type,
      params.sentAt,
      params.receiverId,
      params.roomId,
    );
  }
}
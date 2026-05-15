import { Request, Response } from 'express';
import type { IMessageRepository } from '../../../domain/ports/repositories';

export class MessageController {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async handlePrivate(req: Request, res: Response) {
    try {
      const { userIdA, userIdB } = req.query as {
        userIdA?: string;
        userIdB?: string;
      };
      if (!userIdA || !userIdB)
        return res
          .status(400)
          .json({ message: 'userIdA et userIdB sont requis.' });
      const messages = await this.messageRepository.findPrivateHistory(
        userIdA,
        userIdB,
      );
      res.json(
        messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          sentAt: m.sentAt,
        })),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ message });
    }
  }

  async handleGroup(req: Request, res: Response) {
    try {
      const { roomId } = req.query as { roomId?: string };
      if (!roomId)
        return res.status(400).json({ message: 'roomId est requis.' });
      const messages = await this.messageRepository.findGroupHistory(roomId);
      res.json(
        messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          sentAt: m.sentAt,
        })),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ message });
    }
  }
}

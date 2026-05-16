import express, { Application, Request, Response } from 'express';
import { InMemoryCourierRepository } from '../../repositories/in-memory/InMemoryCourierRepository';
import { InMemoryDeliveryRepository } from '../../repositories/in-memory/InMemoryDeliveryRepository';
import { InMemoryMessageRepository } from '../../repositories/in-memory/InMemoryMessageRepository';
import { AssignDelivery } from '../../../application/use-cases/AssignDelivery';
import { CompleteDelivery } from '../../../application/use-cases/CompleteDelivery';
import { SendMessage } from '../../../application/use-cases/SendMessage';
import { Courier } from '../../../domain/entities/Courier';

export function createExpressApp(): Application {
  const app = express();
  app.use(express.json());

  const courierRepository = new InMemoryCourierRepository();
  const deliveryRepository = new InMemoryDeliveryRepository();
  const messageRepository = new InMemoryMessageRepository();

  const assignDelivery = new AssignDelivery(
    courierRepository,
    deliveryRepository,
  );
  const completeDelivery = new CompleteDelivery(
    courierRepository,
    deliveryRepository,
  );
  const sendMessage = new SendMessage(messageRepository);

  app.post('/couriers/deliveries', async (req: Request, res: Response) => {
    try {
      const delivery = await assignDelivery.execute(req.body);
      res.status(201).json({
        id: delivery.id,
        orderId: delivery.orderId,
        status: delivery.status,
        courierId: delivery.courierId,
        distanceKm: delivery.distanceKm,
        earnings: delivery.earnings,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post(
    '/couriers/deliveries/:id/complete',
    async (req: Request, res: Response) => {
      try {
        const delivery = await completeDelivery.execute({
          deliveryId: req.params.id as string,
        });
        res.status(200).json({
          id: delivery.id,
          status: delivery.status,
          earnings: delivery.earnings,
        });
      } catch (error) {
        res.status(404).json({ message: (error as Error).message });
      }
    },
  );

  app.get('/messages/private', async (req: Request, res: Response) => {
    try {
      const { userIdA, userIdB } = req.query as {
        userIdA: string;
        userIdB: string;
      };
      if (!userIdA || !userIdB) {
        res.status(400).json({ message: 'userIdA et userIdB sont requis.' });
        return;
      }
      const messages = await messageRepository.findPrivateHistory(
        userIdA,
        userIdB,
      );
      res.status(200).json(
        messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          sentAt: m.sentAt,
        })),
      );
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get('/messages/group', async (req: Request, res: Response) => {
    try {
      const { roomId } = req.query as { roomId: string };
      if (!roomId) {
        res.status(400).json({ message: 'roomId est requis.' });
        return;
      }
      const messages = await messageRepository.findGroupHistory(roomId);
      res.status(200).json(
        messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          sentAt: m.sentAt,
        })),
      );
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post('/seed', async (_req: Request, res: Response) => {
    const courier = Courier.create({
      id: 'courier-1',
      name: 'Jean Dupont',
      tier: 'STANDARD',
    });
    const courierAvailable = courier.setAvailable();
    await courierRepository.save(courierAvailable);
    res.status(201).json({ message: 'Livreur courier-1 créé en mémoire.' });
  });

  return app;
}

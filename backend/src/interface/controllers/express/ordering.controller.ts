import { Request, Response } from 'express';
import { CreateOrder } from '../../../application/use-cases/Ordering/CreateOrder';
import type { CreateOrderDTO } from '../../../application/dto/create-order.dto';
import { PayOrder } from '../../../application/use-cases/Ordering/PayOrder';
import { GetOrderDetails } from '../../../application/use-cases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../../application/use-cases/Ordering/GetOrderHistory';

export class OrderingController {
  constructor(
    private readonly createOrder: CreateOrder,
    private readonly payOrder: PayOrder,
    private readonly getDetails: GetOrderDetails,
    private readonly getHistory: GetOrderHistory,
  ) {}

  async handleCreate(request: Request, response: Response): Promise<void> {
    try {
      const body: unknown = request.body;
      if (typeof body !== 'object' || body === null) {
        response.status(400).json({ error: 'Invalid body' });
        return;
      }
      const dto = body as unknown as CreateOrderDTO;
      const result = await this.createOrder.execute(dto);
      if (result.isFailure) {
        response.status(400).json({ error: result.error });
        return;
      }
      response.status(201).json(result.getValue());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }

  async handleGetDetails(request: Request, response: Response): Promise<void> {
    try {
      const orderId = request.params.id as string;
      const order = await this.getDetails.execute(orderId);

      if (!order) {
        response.status(404).json({ error: 'COMMANDE_INTROUVABLE' });
        return;
      }

      response.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }

  async handlePay(request: Request, response: Response): Promise<void> {
    try {
      const orderId = request.params.id as string;
      const result = await this.payOrder.execute(orderId);
      if (result.isFailure) {
        response.status(400).json({ error: result.error });
        return;
      }
      response.json(result.getValue());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }

  async handleGetHistory(request: Request, response: Response): Promise<void> {
    try {
      const clientId = request.params.clientId as string;
      const history = await this.getHistory.execute(clientId);
      response.json(history);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }
}

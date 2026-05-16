import { Request, Response } from 'express';
import { CreateOrder } from '../../application/usecases/Ordering/CreateOrder';
import { PayOrder } from '../../application/usecases/Ordering/PayOrder';
import { GetOrderDetails } from '../../application/usecases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../application/usecases/Ordering/GetOrderHistory';
import { CreateOrderDTO } from '../../application/dto/create-order.dto';

export class OrderingController {
  constructor(
    private readonly createOrder: CreateOrder,
    private readonly payOrder: PayOrder,
    private readonly getDetails: GetOrderDetails,
    private readonly getHistory: GetOrderHistory,
  ) {}

  async handleCreate(request: Request, response: Response): Promise<void> {
    try {
      const dto = request.body as CreateOrderDTO;
      const order = await this.createOrder.execute(dto);
      response.status(201).json(order);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue';
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue';
      response.status(400).json({ error: message });
    }
  }

  async handlePay(request: Request, response: Response): Promise<void> {
    try {
      const orderId = request.params.id as string;
      const invoice = await this.payOrder.execute(orderId);
      response.json(invoice);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue';
      response.status(400).json({ error: message });
    }
  }

  async handleGetHistory(request: Request, response: Response): Promise<void> {
    try {
      const clientId = request.params.clientId as string;
      const history = await this.getHistory.execute(clientId);
      response.json(history);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue';
      response.status(400).json({ error: message });
    }
  }
}

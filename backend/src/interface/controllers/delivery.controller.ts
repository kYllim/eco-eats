import { Request, Response } from 'express';
import { UpdateDeliveryStatus } from '../../application/usecases/Delivery/UpdateDeliveryStatus';
import { OrderStatus } from '../../domain/value-objects/OrderStatus';

export class DeliveryController {
  constructor(private readonly updateDeliveryStatus: UpdateDeliveryStatus) {}

  async handleUpdateStatus(
    request: Request,
    response: Response,
  ): Promise<void> {
    try {
      const orderId = request.params.id as string;

      const body = request.body as { status: OrderStatus };

      const updatedOrder = await this.updateDeliveryStatus.execute(
        orderId,
        body.status,
      );
      response.json(updatedOrder);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue';
      response.status(400).json({ error: message });
    }
  }
}

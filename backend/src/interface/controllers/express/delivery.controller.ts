import { Request, Response } from 'express';
import { UpdateDeliveryStatus } from '../../../application/use-cases/Delivery/UpdateDeliveryStatus';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

export class DeliveryController {
  constructor(private readonly updateDeliveryStatus: UpdateDeliveryStatus) {}

  async handleUpdateStatus(
    request: Request,
    response: Response,
  ): Promise<void> {
    try {
      const orderId = request.params.id as string;
      const body: unknown = request.body;
      if (typeof body !== 'object' || body === null) {
        response.status(400).json({ error: 'Invalid body' });
        return;
      }
      const status: unknown = (body as Record<string, unknown>)['status'];
      if (typeof status !== 'string') {
        response.status(400).json({ error: 'Status is required' });
        return;
      }
      if (
        !Object.values(OrderStatus).includes(status as unknown as OrderStatus)
      ) {
        response.status(400).json({ error: 'Invalid status' });
        return;
      }
      const updatedOrder = await this.updateDeliveryStatus.execute(
        orderId,
        status as unknown as OrderStatus,
      );

      response.json(updatedOrder);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }
}

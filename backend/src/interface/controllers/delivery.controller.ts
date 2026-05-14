import { Request, Response } from 'express';
import { UpdateDeliveryStatus } from '../../application/usecases/Delivery/UpdateDeliveryStatus';

export class DeliveryController {
  constructor(
    private readonly updateDeliveryStatus: UpdateDeliveryStatus
  ) {}


  async handleUpdateStatus(request: Request, response: Response): Promise<void> {
    try {
      const orderId = request.params.id as string;
      const { status } = request.body;
      
      const updatedOrder = await this.updateDeliveryStatus.execute(orderId, status);
      
      response.json(updatedOrder);
    } catch (error: any) {
      response.status(400).json({ error: error.message });
    }
  }
}
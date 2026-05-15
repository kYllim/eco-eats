import { Request, Response } from 'express';
import { AssignDelivery } from '../../../application/use-cases/AssignDelivery';
import { CompleteDelivery } from '../../../application/use-cases/CompleteDelivery';

export class CourierController {
  constructor(
    private readonly assignDelivery: AssignDelivery,
    private readonly completeDelivery: CompleteDelivery,
  ) {}

  async handleAssign(req: Request, res: Response) {
    try {
      const requestBody = req.body as Record<string, unknown>;
      const command = {
        deliveryId: String(requestBody['deliveryId']),
        orderId: String(requestBody['orderId']),
        restaurantId: String(requestBody['restaurantId']),
        courierId: String(requestBody['courierId']),
        pickupLatitude: Number(requestBody['pickupLatitude']),
        pickupLongitude: Number(requestBody['pickupLongitude']),
        dropoffLatitude: Number(requestBody['dropoffLatitude']),
        dropoffLongitude: Number(requestBody['dropoffLongitude']),
        tipEur: Number(requestBody['tipEur']),
      };
      const result = await this.assignDelivery.execute(command);
      if (result.isFailure)
        return res.status(400).json({ message: result.error });
      const delivery = result.getValue();
      res.status(201).json({
        id: delivery.id,
        orderId: delivery.orderId,
        status: delivery.status,
        courierId: delivery.courierId,
        distanceKm: delivery.distanceKm,
        earnings: delivery.earnings,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ message });
    }
  }

  async handleComplete(req: Request, res: Response) {
    try {
      const deliveryId = String(req.params.id);
      const delivery = await this.completeDelivery.execute({ deliveryId });
      res.status(200).json({
        id: delivery.id,
        status: delivery.status,
        earnings: delivery.earnings,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(404).json({ message });
    }
  }
}

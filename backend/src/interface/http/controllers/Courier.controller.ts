import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AssignDelivery } from '../../../application/use-cases/AssignDelivery';
import { CompleteDelivery } from '../../../application/use-cases/CompleteDelivery';

interface AssignDeliveryBody {
  deliveryId: string;
  orderId: string;
  restaurantId: string;
  courierId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  tipEur: number;
}

@Controller('couriers')
export class CourierController {
  constructor(
    private readonly assignDelivery: AssignDelivery,
    private readonly completeDelivery: CompleteDelivery,
  ) {}

  @Post('deliveries')
  @HttpCode(201)
  async assignDeliveryRoute(@Body() body: AssignDeliveryBody): Promise<object> {
    try {
      const delivery = await this.assignDelivery.execute(body);
      return {
        id: delivery.id,
        orderId: delivery.orderId,
        status: delivery.status,
        courierId: delivery.courierId,
        distanceKm: delivery.distanceKm,
        earnings: delivery.earnings,
      };
    } catch (error) {
      const message = (error as Error).message;
      if (message.startsWith('Livreur introuvable')) {
        throw new NotFoundException(message);
      }
      throw new BadRequestException(message);
    }
  }

  @Post('deliveries/:id/complete')
  @HttpCode(200)
  async completeDeliveryRoute(
    @Param('id') deliveryId: string,
  ): Promise<object> {
    try {
      const delivery = await this.completeDelivery.execute({ deliveryId });
      return {
        id: delivery.id,
        status: delivery.status,
        earnings: delivery.earnings,
      };
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('introuvable')) {
        throw new NotFoundException(message);
      }
      throw new BadRequestException(message);
    }
  }
}

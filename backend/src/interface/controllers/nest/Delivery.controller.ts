import {
  Controller,
  Patch,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { UpdateDeliveryStatus } from '../../../application/use-cases/Delivery/UpdateDeliveryStatus';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';
import type { UpdateDeliveryStatusDTO } from '../../../application/dto/update-delivery-status.dto';

@Controller('orders')
export class DeliveryController {
  constructor(private readonly updateDeliveryStatus: UpdateDeliveryStatus) {}

  @Patch(':id/status')
  async update(@Param('id') id: string, @Body() body: UpdateDeliveryStatusDTO) {
    if (!Object.values(OrderStatus).includes(body.status)) {
      throw new BadRequestException('Invalid status');
    }
    return await this.updateDeliveryStatus.execute(id, body.status);
  }
}

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrder } from '../../../application/use-cases/Ordering/CreateOrder';
import type { CreateOrderDTO } from '../../../application/dto/create-order.dto';
import { PayOrder } from '../../../application/use-cases/Ordering/PayOrder';
import { GetOrderDetails } from '../../../application/use-cases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../../application/use-cases/Ordering/GetOrderHistory';

@Controller('orders')
export class OrderingController {
  constructor(
    private readonly createOrder: CreateOrder,
    private readonly payOrder: PayOrder,
    private readonly getDetails: GetOrderDetails,
    private readonly getHistory: GetOrderHistory,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateOrderDTO) {
    const result = await this.createOrder.execute(body);
    if (result.isFailure) throw new BadRequestException(result.error);

    return result.getValue();
  }

  @Get(':id')
  async details(@Param('id') id: string) {
    const order = await this.getDetails.execute(id);
    if (!order) throw new BadRequestException('COMMANDE_INTROUVABLE');
    return order;
  }

  @Post(':id/pay')
  async pay(@Param('id') id: string) {
    const result = await this.payOrder.execute(id);
    if (result.isFailure) throw new BadRequestException(result.error);

    return result.getValue();
  }

  @Get('/clients/:clientId')
  async history(@Param('clientId') clientId: string) {
    return await this.getHistory.execute(clientId);
  }
}

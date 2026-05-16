import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrder } from '../../../application/usecases/Ordering/CreateOrder';
import { PayOrder } from '../../../application/usecases/Ordering/PayOrder';
import { GetOrderDetails } from '../../../application/usecases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../../application/usecases/Ordering/GetOrderHistory';
import { CreateOrderDTO } from '../../../application/dto/create-order.dto';

@Controller('api/ordering')
export class OrderingController {
  constructor(
    private readonly createOrder: CreateOrder,
    private readonly payOrder: PayOrder,
    private readonly getDetails: GetOrderDetails,
    private readonly getHistory: GetOrderHistory,
  ) {}

  /**
   * POST /api/ordering
   */
  @Post()
  async handleCreate(@Body() dto: any) {
    try {
      return await this.createOrder.execute(dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Erreur de création',
      );
    }
  }

  /**
   * Récupère le détail d'une commande
   * GET /api/ordering/:id
   */
  @Get(':id')
  async handleGetDetails(@Param('id') id: string) {
    try {
      const order = await this.getDetails.execute(id);
      if (!order) {
        throw new NotFoundException('COMMANDE_INTROUVABLE');
      }
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Erreur de récupération',
      );
    }
  }

  /**
   * Paye une commande
   * POST /api/ordering/:id/pay
   */
  @Post(':id/pay')
  async handlePay(@Param('id') id: string) {
    try {
      return await this.payOrder.execute(id);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Erreur de paiement',
      );
    }
  }

  /**
   * Récupère l'historique d'un client
   * GET /api/ordering/history/:clientId
   */
  @Get('history/:clientId')
  async handleGetHistory(@Param('clientId') clientId: string) {
    try {
      return await this.getHistory.execute(clientId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Erreur d'historique",
      );
    }
  }
}

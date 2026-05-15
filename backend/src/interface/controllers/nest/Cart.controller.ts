import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AddToCart } from '../../../application/use-cases/Cart/AddToCart';
import { GetCart } from '../../../application/use-cases/Cart/GetCart';
import { ClearCart } from '../../../application/use-cases/Cart/ClearCart';
import { CheckoutCart } from '../../../application/use-cases/Cart/CheckoutCart';

@Controller('clients/:clientId/cart')
export class CartController {
  constructor(
    private readonly addToCart: AddToCart,
    private readonly getCart: GetCart,
    private readonly clearCart: ClearCart,
    private readonly checkout: CheckoutCart,
  ) {}

  @Post()
  @HttpCode(200)
  async add(@Param('clientId') clientId: string, @Body() body: unknown) {
    try {
      const requestBody =
        typeof body === 'object' && body !== null
          ? (body as Record<string, unknown>)
          : {};
      const consumableId =
        typeof requestBody.consumableId === 'string'
          ? requestBody.consumableId
          : '';
      const result = await this.addToCart.execute(clientId, consumableId);
      if (result.isFailure) throw new BadRequestException(result.error);
      return result.getValue();
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get()
  async get(@Param('clientId') clientId: string) {
    const cart = await this.getCart.execute(clientId);
    return cart ?? { items: [] };
  }

  @Post('/checkout')
  async checkoutRoute(
    @Param('clientId') clientId: string,
    @Body() body: unknown,
  ) {
    const requestBody =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const location = {
      lat: Number(requestBody.lat ?? 0),
      lon: Number(requestBody.lon ?? 0),
    };
    const result = await this.checkout.execute(clientId, location);
    if (result.isFailure) throw new BadRequestException(result.error);
    return result.getValue();
  }

  @Post('/clear')
  @HttpCode(204)
  async clear(@Param('clientId') clientId: string) {
    await this.clearCart.execute(clientId);
  }
}

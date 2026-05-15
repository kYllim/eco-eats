import { Request, Response } from 'express';
import { AddToCart } from '../../../application/use-cases/Cart/AddToCart';
import { GetCart } from '../../../application/use-cases/Cart/GetCart';
import { ClearCart } from '../../../application/use-cases/Cart/ClearCart';
import { CheckoutCart } from '../../../application/use-cases/Cart/CheckoutCart';

export class CartController {
  constructor(
    private readonly addToCart: AddToCart,
    private readonly getCart: GetCart,
    private readonly clearCart: ClearCart,
    private readonly checkout: CheckoutCart,
  ) {}

  async handleAdd(request: Request, response: Response): Promise<void> {
    try {
      const clientId = request.params.clientId as string;
      const { consumableId } = request.body as { consumableId: string };
      const result = await this.addToCart.execute(clientId, consumableId);
      if (result.isFailure) {
        response.status(400).json({ error: result.error });
        return;
      }
      response.status(200).json(result.getValue());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }

  async handleGet(request: Request, response: Response): Promise<void> {
    try {
      const clientId = request.params.clientId as string;
      const cart = await this.getCart.execute(clientId);
      response.json(cart ?? { items: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }

  async handleClear(request: Request, response: Response): Promise<void> {
    try {
      const clientId = request.params.clientId as string;
      await this.clearCart.execute(clientId);
      response.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }

  async handleCheckout(request: Request, response: Response): Promise<void> {
    try {
      const clientId = request.params.clientId as string;
      const loc = request.body as { lat: number; lon: number };
      const result = await this.checkout.execute(clientId, loc);
      if (result.isFailure) {
        response.status(400).json({ error: result.error });
        return;
      }
      response.json(result.getValue());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.status(400).json({ error: message });
    }
  }
}

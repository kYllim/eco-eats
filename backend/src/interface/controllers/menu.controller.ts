import { Request, Response } from 'express';
import { GetConsumable } from '../../application/usecases/Consumable/GetConsumable';
import { UpdateConsumable } from '../../application/usecases/Consumable/UpdateConsumable';
import { RemoveConsumable } from '../../application/usecases/Consumable/RemoveConsumable';

export class MenuController {
  constructor(
    private readonly getConsumable: GetConsumable,
    private readonly updateConsumable: UpdateConsumable,
    private readonly removeConsumable: RemoveConsumable,
  ) {}

  async handleGet(request: Request, response: Response): Promise<void> {
    try {
      const consumableId = request.params.id as string;
      const consumable = await this.getConsumable.execute(consumableId);

      if (!consumable) {
        response.status(404).json({ error: 'PLAT_INTROUVABLE' });
        return;
      }

      response.json(consumable);
    } catch (error) {
      this.handleError(response, error);
    }
  }

  async handleUpdate(request: Request, response: Response): Promise<void> {
    try {
      const consumableId = request.params.id as string;
      const updatedConsumable = await this.updateConsumable.execute(
        consumableId,
        request.body,
      );
      response.json(updatedConsumable);
    } catch (error) {
      this.handleError(response, error);
    }
  }

  async handleRemove(request: Request, response: Response): Promise<void> {
    try {
      const consumableId = request.params.id as string;
      await this.removeConsumable.execute(consumableId);
      response.status(204).send();
    } catch (error) {
      this.handleError(response, error);
    }
  }

  private handleError(response: Response, error: unknown): void {
    const message =
      error instanceof Error
        ? error.message
        : 'Une erreur inconnue est survenue';
    response.status(400).json({ error: message });
  }
}

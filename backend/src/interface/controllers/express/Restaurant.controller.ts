import { Request, Response } from 'express';
import { CreateRestaurant } from '../../../application/use-cases/CreateRestaurant';
import type { CreateRestaurantDTO } from '../../../application/use-cases/CreateRestaurant';
import type { RestaurantRepository } from '../../../application/ports/restaurant.repository';

export class RestaurantController {
  constructor(
    private readonly createRestaurant: CreateRestaurant,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async handleCreate(req: Request, res: Response) {
    try {
      const body = req.body as CreateRestaurantDTO;
      const restaurant = await this.createRestaurant.execute(body);
      res.status(201).json({
        id: restaurant.id,
        name: restaurant.name,
        ownerId: restaurant.ownerId,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(400).json({ error: message });
    }
  }

  async handleList(_req: Request, res: Response) {
    const restaurants = await this.restaurantRepository.findAll();
    res.json(
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        isOpen: restaurant.isOpen,
      })),
    );
  }
}

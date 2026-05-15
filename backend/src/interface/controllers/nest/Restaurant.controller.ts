import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { CreateRestaurant } from '../../../application/use-cases/CreateRestaurant';
import type { CreateRestaurantDTO } from '../../../application/use-cases/CreateRestaurant';
import { RESTAURANT_REPOSITORY } from '../../../domain/ports/tokens';
import type { RestaurantRepository } from '../../../application/ports/restaurant.repository';

@Controller('restaurants')
export class RestaurantController {
  constructor(
    private readonly createRestaurant: CreateRestaurant,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  @Post()
  async create(@Body() body: CreateRestaurantDTO) {
    const restaurant = await this.createRestaurant.execute(body);
    return {
      id: restaurant.id,
      name: restaurant.name,
      ownerId: restaurant.ownerId,
    };
  }

  @Get()
  async list() {
    const restaurants = await this.restaurantRepository.findAll();
    return restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      isOpen: r.isOpen,
    }));
  }
}

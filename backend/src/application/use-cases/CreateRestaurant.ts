import { Restaurant } from '../../domain/entities/Restaurant';
import { RestaurantRepository } from '../ports/restaurant.repository';
import { Coordinates } from '../../domain/value-objects/DeliveryDistance';

export interface CreateRestaurantDTO {
  id?: string;
  ownerId: string;
  name: string;
  location: Coordinates;
}

export class CreateRestaurant {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(input: CreateRestaurantDTO): Promise<Restaurant> {
    const id = input.id ?? Math.random().toString(36).substring(7);
    const restaurant = new Restaurant(
      id,
      input.ownerId,
      input.name,
      input.location,
      true,
    );
    await this.restaurantRepository.save(restaurant);
    return restaurant;
  }
}

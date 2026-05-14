import { Restaurant } from '../../../domain/entities/Restaurant';
import { RestaurantRepository } from '../../../application/ports/restaurant.repository';

export class InMemoryRestaurantRepository implements RestaurantRepository {
  private restaurants: Restaurant[] = [];

  public async save(restaurant: Restaurant): Promise<void> {
    const index = this.restaurants.findIndex(restaurant => restaurant.id === restaurant.id);
    if (index !== -1) {
      this.restaurants[index] = restaurant;
    } else {
      this.restaurants.push(restaurant);
    }
  }

  public async findById(id: string): Promise<Restaurant | null> {
    return this.restaurants.find(restaurant => restaurant.id === id) || null;
  }

  public async findAll(): Promise<Restaurant[]> {
    return [...this.restaurants];
  }
}
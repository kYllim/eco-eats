import { Restaurant } from '../../../domain/entities/Restaurant';
import { RestaurantRepository } from '../../../application/ports/restaurant.repository';

export class InMemoryRestaurantRepository implements RestaurantRepository {
  private restaurants: Restaurant[] = [];

  public save(restaurant: Restaurant): Promise<void> {
    const index = this.restaurants.findIndex((r) => r.id === restaurant.id);
    if (index !== -1) {
      this.restaurants[index] = restaurant;
    } else {
      this.restaurants.push(restaurant);
    }
    return Promise.resolve();
  }

  public findById(id: string): Promise<Restaurant | null> {
    return Promise.resolve(
      this.restaurants.find((restaurant) => restaurant.id === id) || null,
    );
  }

  public findAll(): Promise<Restaurant[]> {
    return Promise.resolve([...this.restaurants]);
  }
}

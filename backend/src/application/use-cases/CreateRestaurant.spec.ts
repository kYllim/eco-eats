import { CreateRestaurant } from './CreateRestaurant';
import { InMemoryRestaurantRepository } from '../../infrastructure/repositories/in-memory/restaurant.in-memory.repository';

describe('CreateRestaurant use-case', () => {
  it('creates and persists a restaurant', async () => {
    const repo = new InMemoryRestaurantRepository();
    const usecase = new CreateRestaurant(repo);

    const dto = {
      ownerId: 'owner-1',
      name: 'Test Resto',
      location: { latitude: 48.85, longitude: 2.35 },
    };

    const restaurant = await usecase.execute(dto);

    expect(restaurant.id).toBeDefined();
    expect(restaurant.name).toBe('Test Resto');

    const found = await repo.findById(restaurant.id);
    expect(found).not.toBeNull();
    expect(found?.ownerId).toBe('owner-1');
  });
});

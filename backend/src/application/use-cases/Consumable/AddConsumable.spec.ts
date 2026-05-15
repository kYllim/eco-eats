import { AddConsumable } from './AddConsumable';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { Consumable } from '../../../domain/entities/Consumable';
import { Price } from '../../../domain/value-objects/Price';
import { Allergen } from '../../../domain/value-objects/Allergen';
import { RestaurantRepository } from '../../ports/restaurant.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';

class DummyRestaurantRepository implements RestaurantRepository {
  private restaurants: Map<string, Restaurant> = new Map();
  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurants.get(id) || null;
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async save(restaurant: Restaurant): Promise<void> {
    this.restaurants.set(restaurant.id, restaurant);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }
  add(restaurant: Restaurant) {
    this.restaurants.set(restaurant.id, restaurant);
  }
}

class DummyConsumableRepository implements ConsumableRepository {
  private consumables: Map<string, Consumable> = new Map();
  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<Consumable | null> {
    return this.consumables.get(id) || null;
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async findByIds(ids: string[]): Promise<Consumable[]> {
    return ids
      .map((id) => this.consumables.get(id))
      .filter((item) => item !== undefined);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async save(consumable: Consumable): Promise<void> {
    this.consumables.set(consumable.id, consumable);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(): Promise<Consumable[]> {
    return Array.from(this.consumables.values());
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(id: string): Promise<void> {
    // noop
  }
}

describe('AddConsumable use-case', () => {
  let restaurantRepo: DummyRestaurantRepository;
  let consumableRepo: DummyConsumableRepository;
  let addConsumable: AddConsumable;

  beforeEach(() => {
    restaurantRepo = new DummyRestaurantRepository();
    consumableRepo = new DummyConsumableRepository();
    addConsumable = new AddConsumable(consumableRepo, restaurantRepo);
  });

  test('should add consumable to restaurant successfully', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const result = await addConsumable.execute({
      restaurantId: 'rest-1',
      ownerId: 'owner-1',
      name: 'Pizza Margherita',
      description: 'Classic Italian pizza',
      price: new Price(15),
      stock: 20,
      category: 'Main',
      imageUrl: 'https://example.com/pizza.jpg',
      allergens: [],
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('Pizza Margherita');
    expect(result.restaurantId).toBe('rest-1');
    expect(result.stock).toBe(20);
  });

  test('should fail when restaurant not found', async () => {
    await expect(
      addConsumable.execute({
        restaurantId: 'rest-nonexistent',
        ownerId: 'owner-1',
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza',
        price: new Price(15),
        stock: 20,
        category: 'Main',
        imageUrl: 'https://example.com/pizza.jpg',
        allergens: [],
      }),
    ).rejects.toThrow('Restaurant introuvable.');
  });

  test('should fail when owner is not the restaurant owner', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    await expect(
      addConsumable.execute({
        restaurantId: 'rest-1',
        ownerId: 'owner-2',
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza',
        price: new Price(15),
        stock: 20,
        category: 'Main',
        imageUrl: 'https://example.com/pizza.jpg',
        allergens: [],
      }),
    ).rejects.toThrow(
      'Seul le propriétaire du restaurant peut ajouter des articles.',
    );
  });

  test('should save consumable to repository', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const result = await addConsumable.execute({
      restaurantId: 'rest-1',
      ownerId: 'owner-1',
      name: 'Burger',
      description: 'Juicy burger',
      price: new Price(12),
      stock: 15,
      category: 'Main',
      imageUrl: 'https://example.com/burger.jpg',
      allergens: [],
    });

    const saved = await consumableRepo.findById(result.id);
    expect(saved).toBeDefined();
    expect(saved?.name).toBe('Burger');
  });

  test('should create consumable with allergens', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const allergens = ['gluten', 'lactose'];

    const result = await addConsumable.execute({
      restaurantId: 'rest-1',
      ownerId: 'owner-1',
      name: 'Pizza with gluten',
      description: 'Pizza with gluten and lactose',
      price: new Price(15),
      stock: 20,
      category: 'Main',
      imageUrl: 'https://example.com/pizza.jpg',
      allergens: allergens.map((allergen) => new Allergen(allergen)),
    });

    expect(result.allergens.map((allergen) => allergen.name)).toEqual(
      allergens,
    );
  });
});

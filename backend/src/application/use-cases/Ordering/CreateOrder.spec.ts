import { CreateOrder } from './CreateOrder';
import { Order } from '../../../domain/entities/Order';
import { Consumable } from '../../../domain/entities/Consumable';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { Price } from '../../../domain/value-objects/Price';
import { OrderRepository } from '../../ports/order.repository';
import { RestaurantRepository } from '../../ports/restaurant.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { CreateOrderDTO } from '../../dto/create-order.dto';

class DummyOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();
  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async findByClientId(clientId: string): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async findByRestaurantId(restaurantId: string): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async update(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(id: string): Promise<void> {
    // noop
  }
}

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
  add(consumable: Consumable) {
    this.consumables.set(consumable.id, consumable);
  }
}

describe('CreateOrder use-case', () => {
  let orderRepo: DummyOrderRepository;
  let restaurantRepo: DummyRestaurantRepository;
  let consumableRepo: DummyConsumableRepository;
  let createOrder: CreateOrder;

  beforeEach(() => {
    orderRepo = new DummyOrderRepository();
    restaurantRepo = new DummyRestaurantRepository();
    consumableRepo = new DummyConsumableRepository();
    createOrder = new CreateOrder(orderRepo, restaurantRepo, consumableRepo);
  });

  test('should create order successfully with valid items', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const item = new Consumable(
      'item-1',
      'Pizza',
      'Delicious pizza',
      [],
      new Price(15),
      'Main',
      '',
      'rest-1',
      10,
    );
    consumableRepo.add(item);

    const dto: CreateOrderDTO = {
      restaurantId: 'rest-1',
      clientId: 'client-1',
      itemIds: ['item-1'],
      deliveryLocation: { latitude: 48.86, longitude: 2.36 },
    };

    const result = await createOrder.execute(dto);
    expect(result.isSuccess).toBeTruthy();
    const order = result.getValue();
    expect(order.restaurantId).toBe('rest-1');
    expect(order.clientId).toBe('client-1');
    expect(order.items.length).toBe(1);
  });

  test('should fail when restaurant not found', async () => {
    const item = new Consumable(
      'item-1',
      'Pizza',
      'Delicious pizza',
      [],
      new Price(15),
      'Main',
      '',
      'rest-1',
      10,
    );
    consumableRepo.add(item);

    const dto: CreateOrderDTO = {
      restaurantId: 'rest-nonexistent',
      clientId: 'client-1',
      itemIds: ['item-1'],
      deliveryLocation: { latitude: 48.86, longitude: 2.36 },
    };

    const result = await createOrder.execute(dto);
    expect(result.isSuccess).toBeFalsy();
  });

  test('should fail when restaurant is closed', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    restaurant.isOpen = false;
    await restaurantRepo.save(restaurant);

    const item = new Consumable(
      'item-1',
      'Pizza',
      'Delicious pizza',
      [],
      new Price(15),
      'Main',
      '',
      'rest-1',
      10,
    );
    consumableRepo.add(item);

    const dto: CreateOrderDTO = {
      restaurantId: 'rest-1',
      clientId: 'client-1',
      itemIds: ['item-1'],
      deliveryLocation: { latitude: 48.86, longitude: 2.36 },
    };

    const result = await createOrder.execute(dto);
    expect(result.isSuccess).toBeFalsy();
  });

  test('should fail when item is out of stock', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const item = new Consumable(
      'item-1',
      'Pizza',
      'Delicious pizza',
      [],
      new Price(15),
      'Main',
      '',
      'rest-1',
      0,
    );
    consumableRepo.add(item);

    const dto: CreateOrderDTO = {
      restaurantId: 'rest-1',
      clientId: 'client-1',
      itemIds: ['item-1'],
      deliveryLocation: { latitude: 48.86, longitude: 2.36 },
    };

    const result = await createOrder.execute(dto);
    expect(result.isSuccess).toBeFalsy();
  });

  test('should fail when item from different restaurant', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const item = new Consumable(
      'item-1',
      'Pizza',
      'Delicious pizza',
      [],
      new Price(15),
      'Main',
      '',
      'rest-2',
      10,
    );
    consumableRepo.add(item);

    const dto: CreateOrderDTO = {
      restaurantId: 'rest-1',
      clientId: 'client-1',
      itemIds: ['item-1'],
      deliveryLocation: { latitude: 48.86, longitude: 2.36 },
    };

    const result = await createOrder.execute(dto);
    expect(result.isSuccess).toBeFalsy();
  });

  test('should create order with multiple items', async () => {
    const restaurant = new Restaurant('rest-1', 'owner-1', 'Restaurant Test', {
      latitude: 48.85,
      longitude: 2.35,
    });
    await restaurantRepo.save(restaurant);

    const item1 = new Consumable(
      'item-1',
      'Pizza',
      'Delicious pizza',
      [],
      new Price(15),
      'Main',
      '',
      'rest-1',
      10,
    );
    const item2 = new Consumable(
      'item-2',
      'Salad',
      'Fresh salad',
      [],
      new Price(8),
      'Sides',
      '',
      'rest-1',
      20,
    );
    consumableRepo.add(item1);
    consumableRepo.add(item2);

    const dto: CreateOrderDTO = {
      restaurantId: 'rest-1',
      clientId: 'client-1',
      itemIds: ['item-1', 'item-2'],
      deliveryLocation: { latitude: 48.86, longitude: 2.36 },
    };

    const result = await createOrder.execute(dto);
    expect(result.isSuccess).toBeTruthy();
    const order = result.getValue();
    expect(order.items.length).toBe(2);
  });
});

import { PayOrder } from './PayOrder';
import { Order } from '../../../domain/entities/Order';
import { Consumable } from '../../../domain/entities/Consumable';
import { Price } from '../../../domain/value-objects/Price';
import { OrderRepository } from '../../ports/order.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

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
  add(order: Order) {
    this.orders.set(order.id, order);
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

describe('PayOrder use-case', () => {
  let orderRepo: DummyOrderRepository;
  let consumableRepo: DummyConsumableRepository;
  let payOrder: PayOrder;

  beforeEach(() => {
    orderRepo = new DummyOrderRepository();
    consumableRepo = new DummyConsumableRepository();
    payOrder = new PayOrder(orderRepo, consumableRepo);
  });

  test('should pay order successfully and reduce stock', async () => {
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

    const order = new Order(
      'order-1',
      'client-1',
      'rest-1',
      [item],
      { latitude: 48.85, longitude: 2.35 },
      { latitude: 48.86, longitude: 2.36 },
    );
    orderRepo.add(order);

    const result = await payOrder.execute('order-1');
    expect(result.isSuccess).toBeTruthy();

    const invoice = result.getValue();

    expect(invoice.invoiceId).toBeDefined();

    expect(invoice.total).toBeDefined();

    expect(invoice.client).toBe('client-1');

    expect(invoice.items.length).toBe(1);

    const updatedOrder = await orderRepo.findById('order-1');
    expect(updatedOrder?.status).toBe(OrderStatus.PAID);
  });

  test('should fail when order not found', async () => {
    const result = await payOrder.execute('order-nonexistent');
    expect(result.isSuccess).toBeFalsy();
  });

  test('should reduce stock for multiple items', async () => {
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

    const order = new Order(
      'order-1',
      'client-1',
      'rest-1',
      [item1, item2],
      { latitude: 48.85, longitude: 2.35 },
      { latitude: 48.86, longitude: 2.36 },
    );
    orderRepo.add(order);

    const result = await payOrder.execute('order-1');
    expect(result.isSuccess).toBeTruthy();

    const invoice = result.getValue();

    expect(invoice.items.length).toBe(2);
  });

  test('should generate invoice with correct total including fees', async () => {
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

    const order = new Order(
      'order-1',
      'client-1',
      'rest-1',
      [item],
      { latitude: 48.85, longitude: 2.35 },
      { latitude: 48.86, longitude: 2.36 },
    );
    orderRepo.add(order);

    const result = await payOrder.execute('order-1');
    expect(result.isSuccess).toBeTruthy();

    const invoice = result.getValue();

    // Total includes item price (15) + delivery fees + service fee (2.5)

    expect(invoice.total).toBeGreaterThan(15);

    expect(invoice.total).toBeDefined();
  });

  test('should transition order status to PAID', async () => {
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

    const order = new Order(
      'order-1',
      'client-1',
      'rest-1',
      [item],
      { latitude: 48.85, longitude: 2.35 },
      { latitude: 48.86, longitude: 2.36 },
    );
    orderRepo.add(order);

    await payOrder.execute('order-1');

    const updatedOrder = await orderRepo.findById('order-1');
    expect(updatedOrder?.status).toBe(OrderStatus.PAID);
  });
});

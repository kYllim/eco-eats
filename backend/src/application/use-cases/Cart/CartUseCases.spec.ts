import { AddToCart } from './AddToCart';
import { CartInMemoryRepository } from '../../../infrastructure/repositories/in-memory/CartInMemoryRepository';
import { Consumable } from '../../../domain/entities/Consumable';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { GetCart } from './GetCart';
import { CheckoutCart } from './CheckoutCart';
import { CreateOrderDTO } from '../../dto/create-order.dto';
import { Price } from '../../../domain/value-objects/Price';
import { Result } from '../../../domain/shared/result';

class DummyConsumableRepo implements ConsumableRepository {
  private items: Map<string, Consumable> = new Map();
  add(item: Consumable) {
    this.items.set(item.id, item);
  }
  findById(id: string) {
    return Promise.resolve(this.items.get(id) ?? null);
  }
  findByIds(ids: string[]) {
    return Promise.resolve(
      ids.map((id) => this.items.get(id)).filter(Boolean) as Consumable[],
    );
  }
  save(_c: Consumable) {
    void _c;
    return Promise.resolve();
  }
  findAll() {
    return Promise.resolve(Array.from(this.items.values()));
  }
  delete(_id: string) {
    void _id;
    return Promise.resolve();
  }
}

class DummyCreateOrder {
  execute(dto: CreateOrderDTO): Promise<Result<{ id: string }>> {
    void dto;
    return Promise.resolve(Result.ok<{ id: string }>({ id: 'order-1' }));
  }
}

describe('Cart use-cases', () => {
  test('add item to cart and checkout', async () => {
    const cartRepo = new CartInMemoryRepository();
    const consumableRepo = new DummyConsumableRepo();
    const item = new Consumable(
      'i1',
      'name',
      'desc',
      [],
      new Price(5),
      'cat',
      '',
      'rest-1',
      5,
    );
    consumableRepo.add(item);

    const add = new AddToCart(cartRepo, consumableRepo);
    const get = new GetCart(cartRepo);
    const checkout = new CheckoutCart(cartRepo, new DummyCreateOrder());

    const res = await add.execute('client-1', 'i1');
    expect(res.isSuccess).toBeTruthy();

    const cart = await get.execute('client-1');
    expect(cart).not.toBeNull();
    expect(cart?.getItems().length).toBe(1);

    const cRes = await checkout.execute('client-1', { lat: 0, lon: 0 });
    expect(cRes.isSuccess).toBeTruthy();
    const val = cRes.getValue() as { id: string };
    expect(val.id).toBe('order-1');
  });
});

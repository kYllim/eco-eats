import { Cart } from './Cart';
import { Consumable } from './Consumable';
import { Price } from '../value-objects/Price';

describe('Cart domain rules', () => {
  const restaurantA = 'rest-A';
  const restaurantB = 'rest-B';

  function makeConsumable(id: string, restaurantId: string) {
    return new Consumable(
      id,
      `name-${id}`,
      'desc',
      [],
      new Price(10),
      'cat',
      '',
      restaurantId,
      5,
    );
  }

  test("un panier ne peut contenir que des articles d'un seul restaurant", () => {
    const cart = new Cart('client-1');
    const item1 = makeConsumable('c1', restaurantA);
    const item2 = makeConsumable('c2', restaurantB);

    cart.addItem(item1);
    expect(cart.getItems().length).toBe(1);

    // tenter d'ajouter un article d'un autre restaurant doit lancer
    expect(() => cart.addItem(item2)).toThrow();
  });

  test("vider le panier puis ajouter article d'un autre restaurant fonctionne", () => {
    const cart = new Cart('client-2');
    const item1 = makeConsumable('c1', restaurantA);
    const item2 = makeConsumable('c2', restaurantB);

    cart.addItem(item1);
    expect(cart.getItems().length).toBe(1);

    cart.clear();
    expect(cart.getItems().length).toBe(0);

    cart.addItem(item2);
    expect(cart.getItems().length).toBe(1);
    expect(cart.restaurantId).toBe(restaurantB);
  });
});

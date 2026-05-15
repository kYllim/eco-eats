import { Consumable } from './Consumable';
import { Price } from '../value-objects/Price';

describe('Consumable entity', () => {
  describe('Basic stock operations', () => {
    test('should create consumable with stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        10,
      );

      expect(consumable.stock).toBe(10);
      expect(consumable.isAvailable()).toBe(true);
    });

    test('should reduce stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        10,
      );

      consumable.reduceStock(3);
      expect(consumable.stock).toBe(7);
    });

    test('should fail when reducing more stock than available', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        5,
      );

      expect(() => {
        consumable.reduceStock(10);
      }).toThrow('Stock insuffisant');
    });

    test('should add stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        10,
      );

      consumable.addStock(5);
      expect(consumable.stock).toBe(15);
    });

    test('should be unavailable when stock is 0', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        0,
      );

      expect(consumable.isAvailable()).toBe(false);
    });
  });

  describe('Promotions', () => {
    test('should set promotion percentage', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        10,
      );

      consumable.setPromotion(20);
      expect(consumable.discountPercentage).toBe(20);
    });

    test('should calculate final price with promotion', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(100),
        'Main',
        'pizza.jpg',
        'rest-1',
        10,
      );

      consumable.setPromotion(20); // 20% off
      const finalPrice = consumable.getFinalPrice();
      expect(finalPrice.value).toBe(80);
    });

    test('should fail with invalid promotion percentage', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        10,
      );

      expect(() => {
        consumable.setPromotion(150);
      }).toThrow('La promotion doit être comprise entre 0 et 100%');
    });
  });

  describe('Daily Stock Operations', () => {
    test('should enable daily stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
      );

      expect(consumable.isDailyStockEnabled()).toBe(false);
      consumable.enableDailyStock();
      expect(consumable.isDailyStockEnabled()).toBe(true);
      expect(consumable.stock).toBe(20); // Should have full quota
    });

    test('should disable daily stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
      );

      consumable.enableDailyStock();
      consumable.reduceStock(5);
      expect(consumable.stock).toBe(15);

      consumable.disableDailyStock();
      expect(consumable.isDailyStockEnabled()).toBe(false);
      expect(consumable.stock).toBe(15); // Remaining stock becomes permanent
    });

    test('should manage daily stock quotas separately', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
        0,
        true, // Enable daily stock from start
      );

      expect(consumable.isDailyStockEnabled()).toBe(true);
      expect(consumable.stock).toBe(20);

      consumable.reduceStock(7);
      expect(consumable.stock).toBe(13);
      expect(consumable.isAvailable()).toBe(true);

      // Use up the rest
      consumable.reduceStock(13);
      expect(consumable.stock).toBe(0);
      expect(consumable.isAvailable()).toBe(false);
    });

    test('should get daily stock status', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
        0,
        true,
      );

      consumable.reduceStock(5);

      const status = consumable.getDailyStockStatus();

      expect(status).toBeDefined();

      expect(status.baseStock).toBe(20);

      expect(status.currentStock).toBe(15);

      expect(status.usagePercentage).toBe(25); // 5 used out of 20
    });

    test('should reset daily stock manually', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
        0,
        true,
      );

      consumable.reduceStock(10);
      expect(consumable.stock).toBe(10);

      consumable.resetDailyStock();
      expect(consumable.stock).toBe(20);
    });

    test('should prevent adding stock when daily stock is enabled', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
        0,
        true,
      );

      expect(() => {
        consumable.addStock(5);
      }).toThrow(
        "Impossible d'ajouter du stock à un article avec stock journalier",
      );
    });

    test('should work with permanent stock after disabling daily stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        20,
        0,
        true,
      );

      consumable.reduceStock(5);
      consumable.disableDailyStock();

      // Should now be able to add stock again
      consumable.addStock(10);
      expect(consumable.stock).toBe(25); // 15 (after reduction) + 10 (added)
    });

    test('should handle out of stock with daily stock', () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'pizza.jpg',
        'rest-1',
        3,
        0,
        true,
      );

      consumable.reduceStock(3);
      expect(consumable.isAvailable()).toBe(false);

      expect(() => {
        consumable.reduceStock(1);
      }).toThrow('Stock insuffisant');
    });
  });
});

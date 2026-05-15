import { DailyStock } from './DailyStock';

describe('DailyStock value-object', () => {
  test('should initialize with base stock', () => {
    const dailyStock = new DailyStock(20);
    expect(dailyStock.getAvailable()).toBe(20);
    expect(dailyStock.getBaseStock()).toBe(20);
  });

  test('should initialize with custom current stock', () => {
    const dailyStock = new DailyStock(20, 15);
    expect(dailyStock.getAvailable()).toBe(15);
    expect(dailyStock.getBaseStock()).toBe(20);
  });

  test('should reduce stock', () => {
    const dailyStock = new DailyStock(20);
    dailyStock.reduceStock(5);
    expect(dailyStock.getAvailable()).toBe(15);
  });

  test('should throw error when reducing more than available', () => {
    const dailyStock = new DailyStock(20);
    dailyStock.reduceStock(15);

    expect(() => {
      dailyStock.reduceStock(10);
    }).toThrow('Stock insuffisant');
  });

  test('should report out of stock', () => {
    const dailyStock = new DailyStock(5);
    dailyStock.reduceStock(5);
    expect(dailyStock.isOutOfStock()).toBe(true);
  });

  test('should calculate usage percentage', () => {
    const dailyStock = new DailyStock(20, 15);
    // 5 utilisé sur 20 = 25%
    expect(dailyStock.getUsagePercentage()).toBe(25);
  });

  test('should calculate usage percentage when stock fully used', () => {
    const dailyStock = new DailyStock(20);
    dailyStock.reduceStock(20);
    expect(dailyStock.getUsagePercentage()).toBe(100);
  });

  test('should reset stock manually', () => {
    const dailyStock = new DailyStock(20);
    dailyStock.reduceStock(10);
    expect(dailyStock.getAvailable()).toBe(10);

    dailyStock.resetManually();
    expect(dailyStock.getAvailable()).toBe(20);
  });

  test('should return status object', () => {
    const dailyStock = new DailyStock(20, 15);
    const status = dailyStock.getStatus();

    expect(status.baseStock).toBe(20);
    expect(status.currentStock).toBe(15);
    expect(status.usagePercentage).toBe(25);
    expect(status.lastResetDate).toBeDefined();
  });

  test('should handle multiple reductions', () => {
    const dailyStock = new DailyStock(100);
    dailyStock.reduceStock(10);
    dailyStock.reduceStock(20);
    dailyStock.reduceStock(15);

    expect(dailyStock.getAvailable()).toBe(55);
    expect(dailyStock.getUsagePercentage()).toBe(45);
  });

  test('should reset to base stock at midnight (simulated)', () => {
    const dailyStock = new DailyStock(20);
    dailyStock.reduceStock(10);
    expect(dailyStock.getAvailable()).toBe(10);

    // This test simulates the reset behavior
    // In real scenarios, time would pass until the next day
    dailyStock.resetManually();
    expect(dailyStock.getAvailable()).toBe(20);
  });

  test('should prevent negative stock', () => {
    const dailyStock = new DailyStock(5);

    expect(() => {
      dailyStock.reduceStock(10);
    }).toThrow('Stock insuffisant');

    // Stock should remain unchanged
    expect(dailyStock.getAvailable()).toBe(5);
  });
});

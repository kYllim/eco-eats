import { Wallet } from './Wallet';

describe('Wallet', () => {
  it('rejects a negative initial balance', () => {
    expect(() => Wallet.create(-1)).toThrow();
  });

  it('credits an amount and stays immutable', () => {
    const wallet = Wallet.create(10);
    const credited = wallet.credit(5);
    expect(credited.balance).toBe(15);
    expect(wallet.balance).toBe(10);
  });

  it('rejects a negative credit', () => {
    expect(() => Wallet.create(0).credit(-1)).toThrow();
  });

  it('applies the formula base + perKm * km + tip', () => {
    const earnings = Wallet.calculateDeliveryEarnings(4, 2);
    expect(earnings).toBe(1.5 + 0.5 * 4 + 2);
  });
});

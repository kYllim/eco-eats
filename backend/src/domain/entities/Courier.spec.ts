import { Courier } from './Courier';

describe('Courier', () => {
  const make = (overrides: { tier?: 'STANDARD' | 'EXPERT' } = {}) =>
    Courier.create({ id: 'c-1', name: 'Jean', tier: overrides.tier ?? 'STANDARD' }).setAvailable();

  it('rejects an empty name', () => {
    expect(() => Courier.create({ id: 'c', name: '   ' })).toThrow();
  });

  it('starts UNAVAILABLE with no current restaurant', () => {
    const c = Courier.create({ id: 'c', name: 'Jean' });
    expect(c.status).toBe('UNAVAILABLE');
    expect(c.currentRestaurantId).toBeNull();
  });

  it('refuses any delivery when unavailable', () => {
    const c = Courier.create({ id: 'c', name: 'Jean' });
    expect(c.canAcceptDelivery('resto-A')).toBe(false);
  });

  it('STANDARD accepts only one active delivery', () => {
    const courier = make();
    const after = courier.assignDelivery('d-1', 'resto-A');
    expect(after.canAcceptDelivery('resto-A')).toBe(false);
    expect(after.canAcceptDelivery('resto-B')).toBe(false);
  });

  it('EXPERT accepts a 2nd delivery only from the same restaurant', () => {
    const courier = make({ tier: 'EXPERT' });
    const afterFirst = courier.assignDelivery('d-1', 'resto-A');
    expect(afterFirst.canAcceptDelivery('resto-A')).toBe(true);
    expect(afterFirst.canAcceptDelivery('resto-B')).toBe(false);

    const afterSecond = afterFirst.assignDelivery('d-2', 'resto-A');
    expect(afterSecond.canAcceptDelivery('resto-A')).toBe(false);
  });

  it('assignDelivery throws when not allowed', () => {
    const c = make();
    const after = c.assignDelivery('d-1', 'resto-A');
    expect(() => after.assignDelivery('d-2', 'resto-B')).toThrow();
  });

  it('completeDelivery credits the wallet and frees the restaurant when last', () => {
    const c = make({ tier: 'EXPERT' })
      .assignDelivery('d-1', 'resto-A')
      .assignDelivery('d-2', 'resto-A');

    const afterFirst = c.completeDelivery('d-1', 5);
    expect(afterFirst.wallet.balance).toBe(5);
    expect(afterFirst.currentRestaurantId).toBe('resto-A');

    const afterSecond = afterFirst.completeDelivery('d-2', 7);
    expect(afterSecond.wallet.balance).toBe(12);
    expect(afterSecond.currentRestaurantId).toBeNull();
    expect(afterSecond.activeDeliveryIds.length).toBe(0);
  });

  it('setAvailable / setUnavailable preserve other state', () => {
    const c = make({ tier: 'EXPERT' }).assignDelivery('d-1', 'resto-A');
    const off = c.setUnavailable();
    expect(off.status).toBe('UNAVAILABLE');
    expect(off.activeDeliveryIds.length).toBe(1);
    expect(off.currentRestaurantId).toBe('resto-A');
  });
});

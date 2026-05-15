import { Courier } from './Courier';

describe('Courier', () => {
  const make = (overrides: { tier?: 'STANDARD' | 'EXPERT' } = {}) =>
    Courier.create({
      id: 'c-1',
      name: 'Jean',
      tier: overrides.tier ?? 'STANDARD',
    }).setAvailable();

  it('rejects an empty name', () => {
    expect(() => Courier.create({ id: 'c', name: '   ' })).toThrow();
  });

  it('starts UNAVAILABLE with no current restaurant', () => {
    const courier = Courier.create({ id: 'c', name: 'Jean' });
    expect(courier.status).toBe('UNAVAILABLE');
    expect(courier.currentRestaurantId).toBeNull();
  });

  it('refuses any delivery when unavailable', () => {
    const courier = Courier.create({ id: 'c', name: 'Jean' });
    expect(courier.canAcceptDelivery('resto-A')).toBe(false);
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
    const courier = make();
    const assignedCourier = courier.assignDelivery('d-1', 'resto-A');
    expect(() => assignedCourier.assignDelivery('d-2', 'resto-B')).toThrow();
  });

  it('completeDelivery credits the wallet and frees the restaurant when last', () => {
    const c = make({ tier: 'EXPERT' })
      .assignDelivery('d-1', 'resto-A')
      .assignDelivery('d-2', 'resto-A');

    const afterFirst = c.completeDelivery('d-1', 10);
    expect(afterFirst.wallet.balance).toBe(15); // 10 * 1.5 (EXPERT multiplier)
    expect(afterFirst.currentRestaurantId).toBe('resto-A');

    const afterSecond = afterFirst.completeDelivery('d-2', 8);
    expect(afterSecond.wallet.balance).toBe(27); // 15 + (8 * 1.5)
    expect(afterSecond.currentRestaurantId).toBeNull();
    expect(afterSecond.activeDeliveryIds.length).toBe(0);
  });

  it('setAvailable / setUnavailable preserve other state', () => {
    const courier = make({ tier: 'EXPERT' }).assignDelivery('d-1', 'resto-A');
    const unavailableCourier = courier.setUnavailable();
    expect(unavailableCourier.status).toBe('UNAVAILABLE');
    expect(unavailableCourier.activeDeliveryIds.length).toBe(1);
    expect(unavailableCourier.currentRestaurantId).toBe('resto-A');
  });

  describe('EXPERT tier rules', () => {
    it('should allow EXPERT to handle 2 concurrent deliveries', () => {
      const expert = make({ tier: 'EXPERT' });
      expect(expert.getMaxConcurrentDeliveries()).toBe(2);

      const after1 = expert.assignDelivery('d-1', 'resto-A');
      expect(after1.activeDeliveryIds.length).toBe(1);
      expect(after1.canAcceptDelivery('resto-A')).toBe(true);

      const after2 = after1.assignDelivery('d-2', 'resto-A');
      expect(after2.activeDeliveryIds.length).toBe(2);
      expect(after2.canAcceptDelivery('resto-A')).toBe(false);
    });

    it('should give EXPERT higher earnings multiplier', () => {
      const standard = make({ tier: 'STANDARD' });
      const expert = make({ tier: 'EXPERT' });

      expect(standard.getEarningsMultiplier()).toBe(1.0);
      expect(expert.getEarningsMultiplier()).toBe(1.5);
    });

    it('should apply earnings multiplier to EXPERT deliveries', () => {
      const standard = make({ tier: 'STANDARD' });
      const expert = make({ tier: 'EXPERT' });

      const baseCourierAfter = standard.completeDelivery('d-1', 10);
      const expertCourierAfter = expert.completeDelivery('d-1', 10);

      expect(baseCourierAfter.wallet.balance).toBe(10); // 10 * 1.0
      expect(expertCourierAfter.wallet.balance).toBe(15); // 10 * 1.5
    });

    it('should calculate correct earnings for EXPERT with decimal values', () => {
      const expert = make({ tier: 'EXPERT' });
      const finalEarnings = expert.calculateEarnings(7.33);

      // 7.33 * 1.5 = 10.995 ≈ 11.00 (rounded to 2 decimals)
      expect(finalEarnings).toBe(11);
    });

    it('should identify EXPERT as preferred for long distances', () => {
      const standard = make({ tier: 'STANDARD' });
      const expert = make({ tier: 'EXPERT' });

      // Distance >= 2.0 km triggers expert preference
      expect(standard.isPreferredForDistance(2.5)).toBe(false);
      expect(expert.isPreferredForDistance(2.5)).toBe(true);
      expect(expert.isPreferredForDistance(1.9)).toBe(false);
    });

    it('should prioritize EXPERT couriers for long-distance routes', () => {
      const standard1 = make({ tier: 'STANDARD' });
      const standard2 = make({ tier: 'STANDARD' });
      const expert = make({ tier: 'EXPERT' });

      const couriers = [standard1, standard2, expert];
      const preferredForLongDistance = couriers.filter((c) =>
        c.isPreferredForDistance(3.0),
      );

      expect(preferredForLongDistance).toHaveLength(1);
      expect(preferredForLongDistance[0].tier).toBe('EXPERT');
    });

    it('EXPERT should earn more after multiple deliveries', () => {
      const expert = make({ tier: 'EXPERT' })
        .assignDelivery('d-1', 'resto-A')
        .assignDelivery('d-2', 'resto-A');

      const after1 = expert.completeDelivery('d-1', 10);
      expect(after1.wallet.balance).toBe(15); // 10 * 1.5

      const after2 = after1.completeDelivery('d-2', 8);
      expect(after2.wallet.balance).toBe(27); // 15 + (8 * 1.5)
    });

    it('should prevent STANDARD from handling 2 concurrent deliveries', () => {
      const standard = make({ tier: 'STANDARD' });
      expect(standard.getMaxConcurrentDeliveries()).toBe(1);

      const after1 = standard.assignDelivery('d-1', 'resto-A');
      expect(after1.activeDeliveryIds.length).toBe(1);
      expect(after1.canAcceptDelivery('resto-A')).toBe(false);
    });
  });
});

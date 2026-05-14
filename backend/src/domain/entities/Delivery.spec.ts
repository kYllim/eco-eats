import { Delivery } from './Delivery';
import { Location } from '../value-objects/Location';

describe('Delivery', () => {
  const pickup = Location.create(48.8566, 2.3522);
  const dropoff = Location.create(48.8606, 2.3376);

  const build = () =>
    Delivery.create({
      id: 'd-1',
      orderId: 'o-1',
      restaurantId: 'resto-A',
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      tipEur: 1.5,
    });

  it('starts PENDING with no courier', () => {
    const d = build();
    expect(d.status).toBe('PENDING');
    expect(d.courierId).toBeNull();
    expect(d.distanceKm).toBeGreaterThan(0);
  });

  it('cannot be picked up while PENDING', () => {
    expect(() => build().markAsPickedUp()).toThrow();
  });

  it('walks the lifecycle PENDING → ASSIGNED → PICKED_UP → DELIVERED', () => {
    const d = build()
      .assignTo('c-1')
      .markAsPickedUp()
      .markAsDelivered();
    expect(d.status).toBe('DELIVERED');
    expect(d.courierId).toBe('c-1');
  });

  it('cannot be assigned twice', () => {
    const assigned = build().assignTo('c-1');
    expect(() => assigned.assignTo('c-2')).toThrow();
  });

  it('exposes earnings = base + perKm * km + tip', () => {
    const d = build();
    const expected = 1.5 + 0.5 * d.distanceKm + 1.5;
    expect(d.earnings).toBeCloseTo(expected, 5);
  });
});

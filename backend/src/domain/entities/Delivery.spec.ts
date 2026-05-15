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
    const delivery = build();
    expect(delivery.status).toBe('PENDING');
    expect(delivery.courierId).toBeNull();
    expect(delivery.distanceKm).toBeGreaterThan(0);
  });

  it('cannot be picked up while PENDING', () => {
    expect(() => build().markAsPickedUp()).toThrow();
  });

  it('walks the lifecycle PENDING → ASSIGNED → PICKED_UP → DELIVERED', () => {
    const delivery = build().assignTo('c-1').markAsPickedUp().markAsDelivered();
    expect(delivery.status).toBe('DELIVERED');
    expect(delivery.courierId).toBe('c-1');
  });

  it('cannot be assigned twice', () => {
    const assigned = build().assignTo('c-1');
    expect(() => assigned.assignTo('c-2')).toThrow();
  });

  it('exposes earnings = base + perKm * km + tip', () => {
    const delivery = build();
    const expectedEarnings = 1.5 + 0.5 * delivery.distanceKm + 1.5;
    expect(delivery.earnings).toBeCloseTo(expectedEarnings, 5);
  });
});

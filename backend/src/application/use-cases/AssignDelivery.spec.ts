import { AssignDelivery } from './AssignDelivery';
import { InMemoryCourierRepository } from '../../infrastructure/repositories/in-memory/InMemoryCourierRepository';
import { InMemoryDeliveryRepository } from '../../infrastructure/repositories/in-memory/InMemoryDeliveryRepository';
import { Courier } from '../../domain/entities/Courier';

describe('AssignDelivery (use case)', () => {
  let courierRepo: InMemoryCourierRepository;
  let deliveryRepo: InMemoryDeliveryRepository;
  let useCase: AssignDelivery;

  beforeEach(async () => {
    courierRepo = new InMemoryCourierRepository();
    deliveryRepo = new InMemoryDeliveryRepository();
    useCase = new AssignDelivery(courierRepo, deliveryRepo);
    await courierRepo.save(
      Courier.create({ id: 'c-1', name: 'Jean' }).setAvailable(),
    );
  });

  const command = (override: Partial<Parameters<AssignDelivery['execute']>[0]> = {}) => ({
    deliveryId: 'd-1',
    orderId: 'o-1',
    restaurantId: 'resto-A',
    courierId: 'c-1',
    pickupLatitude: 48.8566,
    pickupLongitude: 2.3522,
    dropoffLatitude: 48.8606,
    dropoffLongitude: 2.3376,
    tipEur: 1,
    ...override,
  });

  it('persists an ASSIGNED delivery and updates the courier', async () => {
    const delivery = await useCase.execute(command());
    expect(delivery.status).toBe('ASSIGNED');
    expect(delivery.courierId).toBe('c-1');

    const stored = await deliveryRepo.findById('d-1');
    expect(stored).not.toBeNull();

    const updatedCourier = await courierRepo.findById('c-1');
    expect(updatedCourier!.currentRestaurantId).toBe('resto-A');
    expect(updatedCourier!.activeDeliveryIds).toContain('d-1');
  });

  it('rejects an unknown courier', async () => {
    await expect(useCase.execute(command({ courierId: 'ghost' }))).rejects.toThrow(/Livreur introuvable/);
  });

  it('rejects a duplicate deliveryId', async () => {
    await useCase.execute(command());
    await expect(useCase.execute(command())).rejects.toThrow(/déjà existante/);
  });

  it('rejects when the courier cannot accept', async () => {
    await useCase.execute(command());
    await expect(
      useCase.execute(command({ deliveryId: 'd-2', restaurantId: 'resto-B' })),
    ).rejects.toThrow(/peut pas accepter/);
  });
});

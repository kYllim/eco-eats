import { AssignDelivery } from './AssignDelivery';
import { CompleteDelivery } from './CompleteDelivery';
import { InMemoryCourierRepository } from '../../infrastructure/repositories/in-memory/InMemoryCourierRepository';
import { InMemoryDeliveryRepository } from '../../infrastructure/repositories/in-memory/InMemoryDeliveryRepository';
import { Courier } from '../../domain/entities/Courier';

describe('CompleteDelivery (use case)', () => {
  let courierRepo: InMemoryCourierRepository;
  let deliveryRepo: InMemoryDeliveryRepository;
  let assignUseCase: AssignDelivery;
  let completeUseCase: CompleteDelivery;

  beforeEach(async () => {
    courierRepo = new InMemoryCourierRepository();
    deliveryRepo = new InMemoryDeliveryRepository();
    assignUseCase = new AssignDelivery(courierRepo, deliveryRepo);
    completeUseCase = new CompleteDelivery(courierRepo, deliveryRepo);
    await courierRepo.save(
      Courier.create({ id: 'c-1', name: 'Jean' }).setAvailable(),
    );
    await assignUseCase.execute({
      deliveryId: 'd-1',
      orderId: 'o-1',
      restaurantId: 'resto-A',
      courierId: 'c-1',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      dropoffLatitude: 48.8606,
      dropoffLongitude: 2.3376,
      tipEur: 1,
    });
  });

  it('marks the delivery DELIVERED and credits the courier wallet', async () => {
    const delivery = await completeUseCase.execute({ deliveryId: 'd-1' });
    expect(delivery.status).toBe('DELIVERED');

    const courier = await courierRepo.findById('c-1');
    expect(courier!.wallet.balance).toBeCloseTo(delivery.earnings, 5);
    expect(courier!.activeDeliveryIds.length).toBe(0);
    expect(courier!.currentRestaurantId).toBeNull();
  });

  it('throws when the delivery does not exist', async () => {
    await expect(
      completeUseCase.execute({ deliveryId: 'ghost' }),
    ).rejects.toThrow(/introuvable/);
  });
});

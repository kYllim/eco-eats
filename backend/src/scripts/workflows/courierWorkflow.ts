import { InMemoryCourierRepository } from '../../infrastructure/repositories/in-memory/InMemoryCourierRepository';
import { InMemoryDeliveryRepository } from '../../infrastructure/repositories/in-memory/InMemoryDeliveryRepository';
import { InMemoryOrderRepository } from '../../infrastructure/repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from '../../infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { InMemoryConsumableRepository } from '../../infrastructure/repositories/in-memory/consumable.in-memory.repository';
import { Consumable } from '../../domain/entities/Consumable';
import { Price } from '../../domain/value-objects/Price';
import { AssignDelivery } from '../../application/use-cases/AssignDelivery';
import { CompleteDelivery } from '../../application/use-cases/CompleteDelivery';
import { Courier } from '../../domain/entities/Courier';
import { Restaurant } from '../../domain/entities/Restaurant';
import { Order } from '../../domain/entities/Order';
import { formatWorkflowError } from './workflowError';

type DeliverySummary = {
  id: string;
  courierId: string;
};

type DeliveryAssignmentResult = {
  isFailure: boolean;
  error: string | null;
  getValue: () => DeliverySummary;
};

async function runCourierWorkflow(): Promise<void> {
  console.log('=== Courier workflow start ===');

  const courierRepo = new InMemoryCourierRepository();
  const deliveryRepo = new InMemoryDeliveryRepository();
  const orderRepo = new InMemoryOrderRepository();
  const restaurantRepo = new InMemoryRestaurantRepository();

  const restaurant = new Restaurant('resto-courier', 'owner-x', 'Resto X', {
    latitude: 48.85,
    longitude: 2.35,
  });
  await restaurantRepo.save(restaurant);

  const consumableRepo = new InMemoryConsumableRepository();
  const demoItem = new Consumable(
    'item-courier-1',
    'Item',
    'demo',
    [],
    new Price(5),
    'cat',
    '',
    restaurant.id,
    3,
  );
  await consumableRepo.save(demoItem);

  const fakeOrder = new Order(
    'order-courier-1',
    'client-x',
    restaurant.id,
    [demoItem],
    restaurant.location,
    { latitude: 48.85, longitude: 2.35 },
  );
  await orderRepo.save(fakeOrder);

  const courier = Courier.create({
    id: 'courier-1',
    name: 'Jean Demo',
    tier: 'STANDARD',
    initialBalance: 0,
  });
  const availableCourier = courier.setAvailable();
  await courierRepo.save(availableCourier);

  const assignDeliveryUseCase = new AssignDelivery(courierRepo, deliveryRepo);
  const assignmentResult = (await assignDeliveryUseCase.execute({
    deliveryId: 'delivery-1',
    orderId: fakeOrder.id,
    restaurantId: restaurant.id,
    courierId: availableCourier.id,
    pickupLatitude: restaurant.location.latitude,
    pickupLongitude: restaurant.location.longitude,
    dropoffLatitude: restaurant.location.latitude + 0.01,
    dropoffLongitude: restaurant.location.longitude + 0.01,
    tipEur: 2,
  })) as unknown as DeliveryAssignmentResult;

  if (assignmentResult.isFailure) {
    console.error(
      'Assign failed:',
      formatWorkflowError(assignmentResult.error),
    );
    return;
  }

  const delivery = assignmentResult.getValue();
  console.log(
    'Delivery assigned:',
    delivery.id,
    'courier:',
    delivery.courierId,
  );

  const completeDeliveryUseCase = new CompleteDelivery(
    courierRepo,
    deliveryRepo,
  );
  const deliveryCompletion = await completeDeliveryUseCase.execute({
    deliveryId: delivery.id,
  });
  console.log(
    'Delivery completed:',
    deliveryCompletion.id,
    'earnings:',
    deliveryCompletion.earnings,
  );

  console.log('=== Courier workflow end ===');
}

void runCourierWorkflow().catch((workflowError: unknown) => {
  console.error('Courier workflow error', formatWorkflowError(workflowError));
});

import { InMemoryConsumableRepository } from '../../infrastructure/repositories/in-memory/consumable.in-memory.repository';
import { InMemoryOrderRepository } from '../../infrastructure/repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from '../../infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { Restaurant } from '../../domain/entities/Restaurant';
import { Consumable } from '../../domain/entities/Consumable';
import { Price } from '../../domain/value-objects/Price';
import { CreateOrder } from '../../application/use-cases/Ordering/CreateOrder';
import { PayOrder } from '../../application/use-cases/Ordering/PayOrder';
import { AcceptOrder } from '../../application/use-cases/Restaurant/AcceptOrder';
import { MarkReady } from '../../application/use-cases/Restaurant/MarkReady';
import { formatWorkflowError } from './workflowError';

async function runRestaurateurWorkflow(): Promise<void> {
  console.log('=== Restaurateur workflow start ===');

  const consumableRepo = new InMemoryConsumableRepository();
  const orderRepo = new InMemoryOrderRepository();
  const restaurantRepo = new InMemoryRestaurantRepository();

  const restaurant = new Restaurant(
    'resto-resto',
    'owner-resto',
    'Resto Demo',
    {
      latitude: 48.85,
      longitude: 2.35,
    },
  );
  await restaurantRepo.save(restaurant);

  const pizza = new Consumable(
    'pizza-1',
    'Demo Pizza',
    'Pizza demo',
    [],
    new Price(12),
    'Plat',
    '',
    restaurant.id,
    5,
  );
  await consumableRepo.save(pizza);

  const createOrderUseCase = new CreateOrder(
    orderRepo,
    restaurantRepo,
    consumableRepo,
  );
  const payOrderUseCase = new PayOrder(orderRepo, consumableRepo);

  const orderResult = await createOrderUseCase.execute({
    clientId: 'client-resto',
    restaurantId: restaurant.id,
    itemIds: [pizza.id],
    clientLocation: { latitude: 48.851, longitude: 2.349 },
  });
  if (orderResult.isFailure) {
    console.error(
      'Create order failed:',
      formatWorkflowError(orderResult.error),
    );
    return;
  }
  const order = orderResult.getValue();
  console.log('Order created:', order.id, 'status:', order.status);

  const paymentResult = await payOrderUseCase.execute(order.id);
  if (paymentResult.isFailure) {
    console.error('Payment failed:', formatWorkflowError(paymentResult.error));
    return;
  }
  console.log('Order paid.');

  const acceptOrder = new AcceptOrder(orderRepo);
  const acceptanceResult = await acceptOrder.execute(order.id, 25);
  console.log(
    'Accept result:',
    acceptanceResult.isSuccess
      ? 'ACCEPTED'
      : formatWorkflowError(acceptanceResult.error),
  );

  const markReadyOrder = new MarkReady(orderRepo);
  const readinessResult = await markReadyOrder.execute(order.id);
  console.log(
    'Mark ready result:',
    readinessResult.isSuccess
      ? 'READY'
      : formatWorkflowError(readinessResult.error),
  );

  console.log('=== Restaurateur workflow end ===');
}

void runRestaurateurWorkflow().catch((workflowError: unknown) => {
  console.error(
    'Restaurateur workflow error',
    formatWorkflowError(workflowError),
  );
  process.exit(1);
});

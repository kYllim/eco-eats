import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory/user.in-memory.repository';
import { InMemoryConsumableRepository } from '../../infrastructure/repositories/in-memory/consumable.in-memory.repository';
import { InMemoryOrderRepository } from '../../infrastructure/repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from '../../infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { InMemoryCourierRepository } from '../../infrastructure/repositories/in-memory/InMemoryCourierRepository';
import { InMemoryDeliveryRepository } from '../../infrastructure/repositories/in-memory/InMemoryDeliveryRepository';
import { InMemoryMessageRepository } from '../../infrastructure/repositories/in-memory/InMemoryMessageRepository';
import { CreateRestaurant } from '../../application/use-cases/CreateRestaurant';
import { CreateOrder } from '../../application/use-cases/Ordering/CreateOrder';
import { PayOrder } from '../../application/use-cases/Ordering/PayOrder';
import { AddConsumable } from '../../application/use-cases/Consumable/AddConsumable';
import { AssignDelivery } from '../../application/use-cases/AssignDelivery';
import { CompleteDelivery } from '../../application/use-cases/CompleteDelivery';
import { SendMessage } from '../../application/use-cases/SendMessage';
import { User, UserRole } from '../../domain/entities/User';
import { Price } from '../../domain/value-objects/Price';
import { Allergen } from '../../domain/value-objects/Allergen';
import { Courier as CourierEntity } from '../../domain/entities/Courier';
import { Delivery } from '../../domain/entities/Delivery';
import { Result } from '../../domain/shared/result';
import { formatWorkflowError } from './workflowError';

type CreatedOrder = {
  id: string;
  calculateTotal: () => number;
};

async function runFullSimulation(): Promise<void> {
  console.log('=== Full simulation start ===');

  const userRepo = new InMemoryUserRepository();
  const consumableRepo = new InMemoryConsumableRepository();
  const orderRepo = new InMemoryOrderRepository();
  const restaurantRepo = new InMemoryRestaurantRepository();
  const courierRepo = new InMemoryCourierRepository();
  const deliveryRepo = new InMemoryDeliveryRepository();
  const messageRepo = new InMemoryMessageRepository();

  const owner = new User(
    'owner-1',
    'owner@example.com',
    UserRole.RESTAURANT_OWNER,
    'Owner One',
  );
  const client = new User(
    'client-1',
    'client@example.com',
    UserRole.CLIENT,
    'Client One',
  );
  const courier = new User(
    'courier-1',
    'courier@example.com',
    UserRole.COURIER,
    'Courier One',
  );
  await userRepo.save(owner);
  await userRepo.save(client);
  await userRepo.save(courier);

  const createRestaurantUseCase = new CreateRestaurant(restaurantRepo);
  const restaurant = await createRestaurantUseCase.execute({
    ownerId: owner.id,
    name: 'FullSim Resto',
    location: { latitude: 48.86, longitude: 2.35 },
  });
  console.log('Created restaurant', restaurant.id);

  const addConsumableUseCase = new AddConsumable(
    consumableRepo,
    restaurantRepo,
  );
  const addConsumableInput = {
    restaurantId: restaurant.id,
    ownerId: owner.id,
    name: 'Sim Burger',
    description: 'Burger simulation',
    price: new Price(11.5),
    stock: 10,
    category: 'Main',
    imageUrl: '',
    allergens: [] as Allergen[],
  };
  const consumable = await addConsumableUseCase.execute(addConsumableInput);
  console.log('Created consumable', consumable.id);

  console.log('Simulate creating an order via CreateOrder');
  const createOrderUseCase = new CreateOrder(
    orderRepo,
    restaurantRepo,
    consumableRepo,
  );
  const orderResult = (await createOrderUseCase.execute({
    clientId: client.id,
    restaurantId: restaurant.id,
    itemIds: [consumable.id],
    clientLocation: { latitude: 48.86, longitude: 2.35 },
  })) as unknown as Result<CreatedOrder>;
  if (orderResult.isFailure) {
    console.error(
      'Failed to create order',
      formatWorkflowError(orderResult.error),
    );
    return;
  }
  const order: CreatedOrder = orderResult.getValue();
  console.log('Order created', order.id);

  const payOrderUseCase = new PayOrder(orderRepo, consumableRepo);
  const paymentResult = await payOrderUseCase.execute(order.id);
  if (paymentResult.isFailure) {
    console.error('Payment failed', formatWorkflowError(paymentResult.error));
    return;
  }
  console.log('Order paid');

  const courierEntity = CourierEntity.create({
    id: 'courier-entity-1',
    name: 'Courier Ent',
    tier: 'STANDARD',
    initialBalance: 0,
  });
  const courierAvailable = courierEntity.setAvailable();
  await courierRepo.save(courierAvailable);

  const assignDeliveryUseCase = new AssignDelivery(courierRepo, deliveryRepo);
  const assignmentResult = await assignDeliveryUseCase.execute({
    deliveryId: 'del-full-1',
    orderId: order.id,
    restaurantId: restaurant.id,
    courierId: courierAvailable.id,
    pickupLatitude: restaurant.location.latitude,
    pickupLongitude: restaurant.location.longitude,
    dropoffLatitude: restaurant.location.latitude + 0.01,
    dropoffLongitude: restaurant.location.longitude + 0.01,
    tipEur: 1,
  });
  if (assignmentResult.isFailure) {
    console.error('Assign failed', formatWorkflowError(assignmentResult.error));
    return;
  }
  const assignedDelivery: Delivery = assignmentResult.getValue();
  console.log('Delivery assigned', assignedDelivery.id);

  const completeDeliveryUseCase = new CompleteDelivery(
    courierRepo,
    deliveryRepo,
  );
  const deliveryCompletion = await completeDeliveryUseCase.execute({
    deliveryId: assignedDelivery.id,
  });
  console.log(
    'Delivery completed',
    deliveryCompletion.id,
    'earnings',
    deliveryCompletion.earnings,
  );

  const sendMessageUseCase = new SendMessage(messageRepo);
  const privateMessage = await sendMessageUseCase.execute({
    id: 'm1',
    senderId: client.id,
    receiverId: owner.id,
    content: "Bonjour, j'ai une question",
    type: 'PRIVATE',
  });
  console.log('Sent private message', privateMessage.id);
  const groupMessage = await sendMessageUseCase.execute({
    id: 'm2',
    senderId: owner.id,
    roomId: 'room-1',
    content: 'Nouvelle promo !',
    type: 'GROUP',
  });
  console.log('Sent group message', groupMessage.id);

  console.log('=== Full simulation end ===');
}

void runFullSimulation().catch((workflowError: unknown) => {
  console.error('Full simulation error', formatWorkflowError(workflowError));
  process.exit(1);
});

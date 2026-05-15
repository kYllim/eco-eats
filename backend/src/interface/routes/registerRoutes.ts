import { Application, Request, Response } from 'express';
import { InMemoryCourierRepository } from '../../infrastructure/repositories/in-memory/InMemoryCourierRepository';
import { InMemoryDeliveryRepository } from '../../infrastructure/repositories/in-memory/InMemoryDeliveryRepository';
import { InMemoryMessageRepository } from '../../infrastructure/repositories/in-memory/InMemoryMessageRepository';
import { PrismaService } from '../../infrastructure/prisma.service';
import { PrismaConsumableRepository } from '../../infrastructure/repositories/sql/PrismaConsumableRepository';
import { PrismaRestaurantRepository } from '../../infrastructure/repositories/sql/PrismaRestaurantRepository';
import { PrismaOrderRepository } from '../../infrastructure/repositories/sql/PrismaOrderRepository';
import { PrismaCartRepository } from '../../infrastructure/repositories/sql/PrismaCartRepository';

import { CartController } from '../controllers/express/cart.controller';
import { AddToCart } from '../../application/use-cases/Cart/AddToCart';
import { GetCart } from '../../application/use-cases/Cart/GetCart';
import { ClearCart } from '../../application/use-cases/Cart/ClearCart';
import { CheckoutCart } from '../../application/use-cases/Cart/CheckoutCart';
import { CreateOrder } from '../../application/use-cases/Ordering/CreateOrder';

import { OrderingController } from '../controllers/express/ordering.controller';
import { PayOrder } from '../../application/use-cases/Ordering/PayOrder';
import { GetOrderDetails } from '../../application/use-cases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../application/use-cases/Ordering/GetOrderHistory';

import { MenuController } from '../controllers/express/menu.controller';
import { GetConsumable } from '../../application/use-cases/Consumable/GetConsumable';
import { UpdateConsumable } from '../../application/use-cases/Consumable/UpdateConsumable';
import { RemoveConsumable } from '../../application/use-cases/Consumable/RemoveConsumable';
import { AddConsumable } from '../../application/use-cases/Consumable/AddConsumable';
import { Price } from '../../domain/value-objects/Price';
import { Allergen } from '../../domain/value-objects/Allergen';

import { AssignDelivery } from '../../application/use-cases/AssignDelivery';
import { CompleteDelivery } from '../../application/use-cases/CompleteDelivery';
import { Courier } from '../../domain/entities/Courier';
import { RestaurantController } from '../controllers/express/Restaurant.controller';
import { CourierController } from '../controllers/express/Courier.controller';
import { MessageController } from '../controllers/express/Message.controller';
import { CreateRestaurant } from '../../application/use-cases/CreateRestaurant';

export function registerRoutes(app: Application) {
  const courierRepository = new InMemoryCourierRepository();
  const deliveryRepository = new InMemoryDeliveryRepository();
  const messageRepository = new InMemoryMessageRepository();

  const prisma = new PrismaService();
  const consumableRepository = new PrismaConsumableRepository(prisma);
  const restaurantRepository = new PrismaRestaurantRepository(prisma);
  const orderRepository = new PrismaOrderRepository(prisma);
  const cartRepository = new PrismaCartRepository(prisma);

  const addToCart = new AddToCart(cartRepository, consumableRepository);
  const getCart = new GetCart(cartRepository);
  const clearCart = new ClearCart(cartRepository);
  const checkoutCart = new CheckoutCart(
    cartRepository,
    new CreateOrder(
      orderRepository,
      restaurantRepository,
      consumableRepository,
    ),
  );
  const cartController = new CartController(
    addToCart,
    getCart,
    clearCart,
    checkoutCart,
  );

  app.post('/clients/:clientId/cart', (req, res) =>
    cartController.handleAdd(req, res),
  );
  app.get('/clients/:clientId/cart', (req, res) =>
    cartController.handleGet(req, res),
  );
  app.delete('/clients/:clientId/cart', (req, res) =>
    cartController.handleClear(req, res),
  );
  app.post('/clients/:clientId/checkout', (req, res) =>
    cartController.handleCheckout(req, res),
  );

  const createOrderUC = new CreateOrder(
    orderRepository,
    restaurantRepository,
    consumableRepository,
  );
  const payOrderUC = new PayOrder(orderRepository, consumableRepository);
  const getOrderDetailsUC = new GetOrderDetails(orderRepository);
  const getOrderHistoryUC = new GetOrderHistory(orderRepository);
  const orderingController = new OrderingController(
    createOrderUC,
    payOrderUC,
    getOrderDetailsUC,
    getOrderHistoryUC,
  );

  app.post('/orders', (req, res) => orderingController.handleCreate(req, res));
  app.get('/orders/:id', (req, res) =>
    orderingController.handleGetDetails(req, res),
  );
  app.post('/orders/:id/pay', (req, res) =>
    orderingController.handlePay(req, res),
  );
  app.get('/clients/:clientId/orders', (req, res) =>
    orderingController.handleGetHistory(req, res),
  );

  const getConsumable = new GetConsumable(consumableRepository);
  const updateConsumable = new UpdateConsumable(consumableRepository);
  const removeConsumable = new RemoveConsumable(consumableRepository);
  const menuController = new MenuController(
    getConsumable,
    updateConsumable,
    removeConsumable,
  );

  app.get('/menu/:id', (req, res) => menuController.handleGet(req, res));
  app.put('/menu/:id', (req, res) => menuController.handleUpdate(req, res));
  app.delete('/menu/:id', (req, res) => menuController.handleRemove(req, res));

  const addConsumableUC = new AddConsumable(
    consumableRepository,
    restaurantRepository,
  );
  app.post(
    '/restaurants/:restaurantId/consumables',
    async (req: Request, res: Response) => {
      try {
        const bodyPayload: unknown = req.body;
        const requestBody =
          typeof bodyPayload === 'object' && bodyPayload !== null
            ? (bodyPayload as Record<string, unknown>)
            : {};
        const ownerId = String(
          req.header('x-user-id') ?? (requestBody['ownerId'] as string) ?? '',
        );
        if (!ownerId) return res.status(401).json({ error: 'MISSING_USER_ID' });

        const name =
          typeof requestBody['name'] === 'string' ? requestBody['name'] : '';
        const description =
          typeof requestBody['description'] === 'string'
            ? requestBody['description']
            : '';
        const category =
          typeof requestBody['category'] === 'string'
            ? requestBody['category']
            : '';
        const imageUrl =
          typeof requestBody['imageUrl'] === 'string'
            ? requestBody['imageUrl']
            : '';

        const input = {
          restaurantId: String(req.params.restaurantId),
          ownerId,
          name,
          description,
          price: new Price(Number(requestBody['price'] ?? 0)),
          stock: Number(requestBody['stock'] ?? 0),
          category,
          imageUrl,
          allergens: Array.isArray(requestBody['allergens'])
            ? (requestBody['allergens'] as string[]).map(
                (allergenName) => new Allergen(String(allergenName)),
              )
            : [],
        };
        const consumable = await addConsumableUC.execute(input);
        res.status(201).json(consumable);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: message });
      }
    },
  );

  const assignDelivery = new AssignDelivery(
    courierRepository,
    deliveryRepository,
  );
  const completeDelivery = new CompleteDelivery(
    courierRepository,
    deliveryRepository,
  );

  const courierController = new CourierController(
    assignDelivery,
    completeDelivery,
  );
  app.post('/couriers/deliveries', (req: Request, res: Response) =>
    courierController.handleAssign(req, res),
  );
  app.post('/couriers/deliveries/:id/complete', (req: Request, res: Response) =>
    courierController.handleComplete(req, res),
  );

  const messageController = new MessageController(messageRepository);
  app.get('/messages/private', (req: Request, res: Response) =>
    messageController.handlePrivate(req, res),
  );
  app.get('/messages/group', (req: Request, res: Response) =>
    messageController.handleGroup(req, res),
  );

  const createRestaurantUC = new CreateRestaurant(restaurantRepository);
  const restaurantController = new RestaurantController(
    createRestaurantUC,
    restaurantRepository,
  );
  app.post('/restaurants', (req: Request, res: Response) =>
    restaurantController.handleCreate(req, res),
  );
  app.get('/restaurants', (req: Request, res: Response) =>
    restaurantController.handleList(req, res),
  );

  app.post('/seed', async (_req: Request, res: Response) => {
    const courier = Courier.create({
      id: 'courier-1',
      name: 'Jean Dupont',
      tier: 'STANDARD',
    });
    const courierAvailable = courier.setAvailable();
    await courierRepository.save(courierAvailable);
    res.status(201).json({ message: 'Livreur courier-1 créé en mémoire.' });
  });
}

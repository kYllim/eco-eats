import express, { Request, Response } from 'express';

import { InMemoryOrderRepository } from '../../repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from '../../repositories/in-memory/restaurant.in-memory.repository';
import { InMemoryConsumableRepository } from '../../repositories/in-memory/consumable.in-memory.repository';

import { CreateOrder } from '../../../application/use-cases/Ordering/CreateOrder';
import { PayOrder } from '../../../application/use-cases/Ordering/PayOrder';
import { GetOrderDetails } from '../../../application/use-cases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../../application/use-cases/Ordering/GetOrderHistory';
import { UpdateDeliveryStatus } from '../../../application/use-cases/Delivery/UpdateDeliveryStatus';
import { GetConsumable } from '../../../application/use-cases/Consumable/GetConsumable';
import { UpdateConsumable } from '../../../application/use-cases/Consumable/UpdateConsumable';
import { RemoveConsumable } from '../../../application/use-cases/Consumable/RemoveConsumable';

import { OrderingController } from '../../../interface/controllers/express/ordering.controller';
import { MenuController } from '../../../interface/controllers/express/menu.controller';
import { DeliveryController } from '../../../interface/controllers/express/delivery.controller';

const app = express();
app.use(express.json());

const orderRepository = new InMemoryOrderRepository();
const restaurantRepository = new InMemoryRestaurantRepository();
const consumableRepository = new InMemoryConsumableRepository();

const createOrder = new CreateOrder(
  orderRepository,
  restaurantRepository,
  consumableRepository,
);
const payOrder = new PayOrder(orderRepository, consumableRepository);
const getOrderDetails = new GetOrderDetails(orderRepository);
const getOrderHistory = new GetOrderHistory(orderRepository);

const updateDeliveryStatus = new UpdateDeliveryStatus(orderRepository);

const getConsumable = new GetConsumable(consumableRepository);
const updateConsumable = new UpdateConsumable(consumableRepository);
const removeConsumable = new RemoveConsumable(consumableRepository);

const orderingController = new OrderingController(
  createOrder,
  payOrder,
  getOrderDetails,
  getOrderHistory,
);

const menuController = new MenuController(
  getConsumable,
  updateConsumable,
  removeConsumable,
);

const deliveryController = new DeliveryController(updateDeliveryStatus);

app.post('/orders', (req: Request, res: Response) =>
  orderingController.handleCreate(req, res),
);
app.get('/orders/:id', (req: Request, res: Response) =>
  orderingController.handleGetDetails(req, res),
);
app.post('/orders/:id/pay', (req: Request, res: Response) =>
  orderingController.handlePay(req, res),
);
app.get('/users/:clientId/orders', (req: Request, res: Response) =>
  orderingController.handleGetHistory(req, res),
);

app.get('/consumables/:id', (req: Request, res: Response) =>
  menuController.handleGet(req, res),
);
app.patch('/consumables/:id', (req: Request, res: Response) =>
  menuController.handleUpdate(req, res),
);
app.delete('/consumables/:id', (req: Request, res: Response) =>
  menuController.handleRemove(req, res),
);

app.patch('/orders/:id/status', (req: Request, res: Response) =>
  deliveryController.handleUpdateStatus(req, res),
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur Eco-Eats démarré sur le port ${PORT}`);
});

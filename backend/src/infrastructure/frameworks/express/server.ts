import express, { Request, Response } from 'express';

// --- Repositories ---
import { InMemoryOrderRepository } from '../../repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from '../../repositories/in-memory/restaurant.in-memory.repository';
import { InMemoryConsumableRepository } from '../../repositories/in-memory/consumable.in-memory.repository';

// --- Use Cases ---
import { CreateOrder } from '../../../application/usecases/Ordering/CreateOrder';
import { PayOrder } from '../../../application/usecases/Ordering/PayOrder';
import { GetOrderDetails } from '../../../application/usecases/Ordering/GetOrderDetails';
import { GetOrderHistory } from '../../../application/usecases/Ordering/GetOrderHistory';
import { UpdateDeliveryStatus } from '../../../application/usecases/Delivery/UpdateDeliveryStatus';
import { GetConsumable } from '../../../application/usecases/Consumable/GetConsumable';
import { UpdateConsumable } from '../../../application/usecases/Consumable/UpdateConsumable';
import { RemoveConsumable } from '../../../application/usecases/Consumable/RemoveConsumable';

// --- Controllers ---
import { OrderingController } from '../../../interface/controllers/ordering.controller';
import { MenuController } from '../../../interface/controllers/menu.controller';
import { DeliveryController } from '../../../interface/controllers/delivery.controller';

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
  console.log(`🚀 Serveur Eco-Eats démarré sur le port ${PORT}`);
});

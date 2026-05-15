import { InMemoryConsumableRepository } from '../../infrastructure/repositories/in-memory/consumable.in-memory.repository';
import { InMemoryOrderRepository } from '../../infrastructure/repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from '../../infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { CartInMemoryRepository } from '../../infrastructure/repositories/in-memory/CartInMemoryRepository';
import { Restaurant } from '../../domain/entities/Restaurant';
import { Consumable } from '../../domain/entities/Consumable';
import { Price } from '../../domain/value-objects/Price';
import { AddToCart } from '../../application/use-cases/Cart/AddToCart';
import { GetCart } from '../../application/use-cases/Cart/GetCart';
import { CheckoutCart } from '../../application/use-cases/Cart/CheckoutCart';
import { CreateOrder } from '../../application/use-cases/Ordering/CreateOrder';
import { PayOrder } from '../../application/use-cases/Ordering/PayOrder';
import { Result } from '../../domain/shared/result';

type CreatedOrder = {
  id: string;
  calculateTotal: () => number;
};

type PaymentInvoice = {
  invoiceId: string;
  total: number;
  client: string;
  items: Array<{
    name: string;
    price: number;
  }>;
};

type PaymentResult = {
  isFailure: boolean;
  error: string | null;
  getValue: () => PaymentInvoice;
};

async function runClientWorkflow(): Promise<void> {
  console.log('=== Client workflow start ===');

  const consumableRepo = new InMemoryConsumableRepository();
  const orderRepo = new InMemoryOrderRepository();
  const restaurantRepo = new InMemoryRestaurantRepository();
  const cartRepo = new CartInMemoryRepository();

  const restaurant = new Restaurant('resto-demo', 'owner-demo', 'Demo Resto', {
    latitude: 48.8566,
    longitude: 2.3522,
  });
  await restaurantRepo.save(restaurant);

  const burger = new Consumable(
    'burger-demo',
    'Demo Burger',
    'Un burger de démonstration',
    [],
    new Price(9.5),
    'Plat',
    '',
    restaurant.id,
    10,
  );
  await consumableRepo.save(burger);

  const addToCart = new AddToCart(cartRepo, consumableRepo);
  const getCart = new GetCart(cartRepo);

  await addToCart.execute('client-demo', burger.id);
  const cart = await getCart.execute('client-demo');
  if (cart) {
    console.log(
      'Cart items:',
      cart.getItems().map((cartItem) => cartItem.id),
    );
  }

  const createOrderUseCase = new CreateOrder(
    orderRepo,
    restaurantRepo,
    consumableRepo,
  );
  const checkoutCartUseCase = new CheckoutCart(cartRepo, createOrderUseCase);

  console.log('Checkout...');
  const orderResult = (await checkoutCartUseCase.execute('client-demo', {
    lat: 48.8566,
    lon: 2.3522,
  })) as unknown as Result<CreatedOrder>;
  if (orderResult.isFailure) {
    console.error('Checkout failed:', orderResult.error ?? 'ORDER_FAILED');
    return;
  }
  const order: CreatedOrder = orderResult.getValue();
  console.log('Order created:', order.id, 'total:', order.calculateTotal());

  const payOrderUseCase = new PayOrder(orderRepo, consumableRepo);
  const paymentResult = (await payOrderUseCase.execute(
    order.id,
  )) as unknown as PaymentResult;
  if (paymentResult.isFailure) {
    console.error('Payment failed:', paymentResult.error ?? 'PAYMENT_FAILED');
    return;
  }
  const invoice = paymentResult.getValue();
  console.log('Payment succeeded. Invoice:', invoice);

  console.log('=== Client workflow end ===');
}

void runClientWorkflow().catch((workflowError: unknown) => {
  console.error(
    'Client workflow error',
    workflowError instanceof Error
      ? workflowError.message
      : String(workflowError),
  );
  process.exit(1);
});

import { Order } from '../../../domain/entities/Order';
import { Consumable } from '../../../domain/entities/Consumable';
import { OrderRepository } from '../../ports/order.repository';
import { RestaurantRepository } from '../../ports/restaurant.repository';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { CreateOrderDTO } from '../../dto/create-order.dto';

export class CreateOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly consumableRepository: ConsumableRepository,
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Order> {
    const restaurant = await this.restaurantRepository.findById(
      dto.restaurantId,
    );
    if (!restaurant) {
      throw new Error('Aucun restaurant trouvé.');
    }

    if (!restaurant.isOpen) {
      throw new Error(
        'Le restaurant est actuellement fermé. Veuillez réessayer plus tard.',
      );
    }

    const items: Consumable[] = await this.consumableRepository.findByIds(
      dto.itemIds,
    );

    if (items.length === 0) {
      throw new Error('Aucun item trouvé');
    }

    items.forEach((item: Consumable) => {
      if (item.restaurantId !== dto.restaurantId) {
        throw new Error(
          `L'item ${item.name} ne provient pas du restaurant sélectionné.`,
        );
      }
      if (!item.isAvailable()) {
        throw new Error(`L'item ${item.name} est en rupture de stock.`);
      }
    });

    const order = new Order(
      Math.random().toString(36).substring(7),
      dto.clientId,
      dto.restaurantId,
      items,
      restaurant.location,
      dto.clientLocation,
    );

    await this.orderRepository.save(order);

    return order;
  }
}

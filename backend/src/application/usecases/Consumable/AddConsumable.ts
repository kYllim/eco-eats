import { Consumable } from '../../../domain/entities/Consumable';
import { ConsumableRepository } from '../../ports/consumable.repository';
import { RestaurantRepository } from '../../ports/restaurant.repository';
import { Price } from '../../../domain/value-objects/Price';
import { Allergen } from '../../../domain/value-objects/Allergen';
import { feedBus } from '../../../infrastructure/sse/feed.bus';

export class AddConsumable {
  constructor(
    private readonly consumableRepository: ConsumableRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(input: {
    restaurantId: string;
    ownerId: string;
    name: string;
    description: string;
    price: Price;
    stock: number;
    category: string;
    imageUrl: string;
    allergens: Allergen[];
  }): Promise<Consumable> {
    const restaurant = await this.restaurantRepository.findById(
      input.restaurantId,
    );
    if (!restaurant) {
      throw new Error('Restaurant introuvable.');
    }

    if (restaurant.ownerId !== input.ownerId) {
      throw new Error(
        'Seul le propriétaire du restaurant peut ajouter des articles.',
      );
    }

    const consumable = new Consumable(
      Math.random().toString(36).substring(7),
      input.name,
      input.description,
      input.allergens,
      input.price,
      input.category,
      input.imageUrl,
      input.restaurantId,
      input.stock,
    );

    await this.consumableRepository.save(consumable);

    feedBus.broadcast('feed-update', {
      id: consumable.id,
      name: consumable.name,
      description: consumable.description,
      price: consumable.price.value,
      imageUrl: consumable.imageUrl || 'default-food.png',
      discountPercentage: consumable.discountPercentage,
      category: consumable.category,
      allergens: consumable.allergens.map((allergen) => allergen.name),
    } as any);

    return consumable;
  }
}

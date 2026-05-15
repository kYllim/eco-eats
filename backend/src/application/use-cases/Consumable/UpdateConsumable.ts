import { ConsumableRepository } from '../../ports/consumable.repository';
import { Price } from '../../../domain/value-objects/Price';
import { Consumable } from '../../../domain/entities/Consumable';

export interface UpdateConsumableDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export class UpdateConsumable {
  constructor(private readonly consumableRepository: ConsumableRepository) {}

  async execute(id: string, updates: UpdateConsumableDTO): Promise<Consumable> {
    const consumable = await this.consumableRepository.findById(id);
    if (!consumable) {
      throw new Error('Article introuvable pour la mise à jour.');
    }

    if (updates.name) consumable.name = updates.name;
    if (updates.description) consumable.description = updates.description;
    if (updates.price) consumable.price = new Price(updates.price);
    if (updates.stock !== undefined) {
      const diff = updates.stock - consumable.stock;
      if (diff > 0) consumable.addStock(diff);
      else if (diff < 0) consumable.reduceStock(Math.abs(diff));
    }

    await this.consumableRepository.save(consumable);
    return consumable;
  }
}

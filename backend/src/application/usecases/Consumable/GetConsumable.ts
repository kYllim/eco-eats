import { ConsumableRepository } from '../../ports/consumable.repository';

export class GetConsumable {
  constructor(private readonly consumableRepository: ConsumableRepository) {}

  async execute(id: string) {
    const consumable = await this.consumableRepository.findById(id);
    if (!consumable) {
      throw new Error("Article introuvable.");
    }
    return consumable;
  }
}
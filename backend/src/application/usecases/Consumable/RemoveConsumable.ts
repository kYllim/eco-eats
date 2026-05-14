import { ConsumableRepository } from '../../ports/consumable.repository';

export class RemoveConsumable {
  constructor(private readonly consumableRepository: ConsumableRepository) {}

  async execute(id: string): Promise<void> {
    const consumable = await this.consumableRepository.findById(id);
    if (!consumable) {
      throw new Error("Impossible de supprimer : l'article n'existe pas.");
    }
    await this.consumableRepository.delete(id);
  }
}
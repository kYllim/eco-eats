import { Consumable } from '../../domain/entities/Consumable';

export interface ConsumableRepository {
  save(consumable: Consumable): Promise<void>;
  findById(id: string): Promise<Consumable | null>; // pour récupérer un consommable spécifique (ex: lors de la validation d'une commande)
  findByIds(ids: string[]): Promise<Consumable[]>; // pour récupérer plusieurs consommables à la fois (ex: lors de la validation d'une commande)
  findAll(): Promise<Consumable[]>;
  delete(id: string): Promise<void>;
}
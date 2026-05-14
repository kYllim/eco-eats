import { Consumable } from './Consumable';

export class Menu {
  constructor(
    public readonly id: string,
    public readonly restaurantId: string,
    public name: string,
    private items: Consumable[] = [],
    public isActive: boolean = true
  ) {}

  public addItem(item: Consumable): void {
    if (item.restaurantId !== this.restaurantId) {
      throw new Error("L'article doit appartenir au même restaurant que le menu.");
    }
    this.items.push(item);
  }

  public getAvailableItems(): Consumable[] {
    return this.items.filter(item => item.isAvailable());
  }
}
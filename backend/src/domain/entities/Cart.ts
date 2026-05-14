import { Consumable } from './Consumable';

export class Cart {
  constructor(
    public readonly clientId: string,
    private items: Consumable[] = [],
    public restaurantId: string | null = null
  ) {}

  public addItem(item: Consumable): void {
    if (this.restaurantId && item.restaurantId !== this.restaurantId) {
      throw new Error("Tous les articles du panier doivent provenir du même restaurant.");
    }
    if (!this.restaurantId) this.restaurantId = item.restaurantId;
    this.items.push(item);
  }

  public getItems(): Consumable[] { return [...this.items]; }
  
  public calculateTotal(): number {
    return this.items.reduce((acc, item) => acc + item.getFinalPrice().value, 0);
  }

  public clear(): void {
    this.items = [];
    this.restaurantId = null;
  }
}
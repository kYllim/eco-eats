import { Allergen } from "../value-objects/Allergen";
import { Price } from "../value-objects/Price";

export class Consumable {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public allergens: Allergen[],
    public price: Price,
    public category: string,
    public imageUrl: string,
    public readonly restaurantId: string,
    private _stock: number,
    private _discountPercentage: number = 0
  ) {}

  public isAvailable(): boolean {
    return this._stock > 0;
  }

  public addStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("La quantité à ajouter doit être supérieure à 0");
    }
    this._stock += quantity;
  }

  public reduceStock(quantity: number): void {
    if (quantity > this._stock) {
      throw new Error(`Stock insuffisant pour ${this.name}`);
    }
    this._stock -= quantity;
  }

  public setPromotion(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error("La promotion doit être comprise entre 0 et 100%");
    }
    this._discountPercentage = percentage;
  }

  public getFinalPrice(): Price {
    if (this._discountPercentage === 0) {
      return this.price;
    }
    const finalPrice = this.price.value * (1 - this._discountPercentage / 100);
    return new Price(finalPrice);
  }

  get stock(): number {
    return this._stock;
  }

  get discountPercentage(): number {
    return this._discountPercentage;
  }
}
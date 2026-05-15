import { Allergen } from '../value-objects/Allergen';
import { Price } from '../value-objects/Price';
import { DailyStock } from '../value-objects/DailyStock';

export class Consumable {
  private _dailyStock?: DailyStock;

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
    private _discountPercentage: number = 0,
    private _useDailyStock: boolean = false,
  ) {
    if (_useDailyStock) {
      this._dailyStock = new DailyStock(_stock);
    }
  }

  public isAvailable(): boolean {
    if (this._dailyStock) {
      return !this._dailyStock.isOutOfStock();
    }
    return this._stock > 0;
  }

  public addStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La quantité à ajouter doit être supérieure à 0');
    }
    if (this._dailyStock) {
      throw new Error(
        "Impossible d'ajouter du stock à un article avec stock journalier",
      );
    }
    this._stock += quantity;
  }

  public reduceStock(quantity: number): void {
    if (this._dailyStock) {
      this._dailyStock.reduceStock(quantity);
    } else {
      if (quantity > this._stock) {
        throw new Error(`Stock insuffisant pour ${this.name}`);
      }
      this._stock -= quantity;
    }
  }

  public setPromotion(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('La promotion doit être comprise entre 0 et 100%');
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
    if (this._dailyStock) {
      return this._dailyStock.getAvailable();
    }
    return this._stock;
  }

  get discountPercentage(): number {
    return this._discountPercentage;
  }

  /**
   * Active le stock journalier pour ce consommable
   * À partir de ce moment, le stock se réinitialisera chaque jour
   */
  enableDailyStock(): void {
    if (!this._dailyStock) {
      this._dailyStock = new DailyStock(this._stock);
      this._useDailyStock = true;
    }
  }

  /**
   * Désactive le stock journalier et revient au stock permanent
   */
  disableDailyStock(): void {
    if (this._dailyStock) {
      this._stock = this._dailyStock.getAvailable();
      this._dailyStock = undefined;
      this._useDailyStock = false;
    }
  }

  /**
   * Retourne true si le consommable utilise le stock journalier
   */
  isDailyStockEnabled(): boolean {
    return !!this._dailyStock;
  }

  /**
   * Retourne le statut du stock journalier (s'il est actif)
   */
  getDailyStockStatus(): ReturnType<DailyStock['getStatus']> | undefined {
    return this._dailyStock?.getStatus();
  }

  /**
   * Réinitialise manuellement le stock journalier
   */
  resetDailyStock(): void {
    if (this._dailyStock) {
      this._dailyStock.resetManually();
    }
  }
}

import { Consumable } from './Consumable';
import DeliveryDistance, { Coordinates } from '../value-objects/DeliveryDistance';
import Price from '../value-objects/Price';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export default class Order {
  private _status: OrderStatus = OrderStatus.PENDING;
  
  private readonly SERVICE_FEE = new Price(2.50); 
  private readonly PRICE_PER_KM = 1.20; 

  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly restaurantId: string,
    private _items: Consumable[],
    public readonly restaurantLocation: Coordinates,
    public readonly clientLocation: Coordinates
  ) {
    this.validateOrder();
  }

  private validateOrder(): void {
    if (this._items.length === 0) {
      throw new Error("Une commande doit contenir au moins un article.");
    }
  }

  
  public calculateTotal(): number {
    const itemsTotalAmount = this._items.reduce((sum, item) => sum + item.getFinalPrice(), 0);
    const itemsPrice = new Price(itemsTotalAmount);

    const deliveryDistance = new DeliveryDistance(this.restaurantLocation, this.clientLocation);
    const distanceKm = deliveryDistance.getInKilometers();
    
    const deliveryFees = new Price(distanceKm * this.PRICE_PER_KM);
    const finalTotal = new Price(itemsPrice.value + deliveryFees.value + this.SERVICE_FEE.value);

    return finalTotal.value;
  }
  
  get items(): Consumable[] {
    return [...this._items];
  }

  get status(): OrderStatus {
    return this._status;
  }

  public transitionTo(newStatus: OrderStatus): void {
    this._status = newStatus;
  }
}
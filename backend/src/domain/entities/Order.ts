import { Consumable } from './Consumable';
import {
  DeliveryDistance,
  Coordinates,
} from '../value-objects/DeliveryDistance';
import { Price } from '../value-objects/Price';
import { OrderStatus } from '../value-objects/OrderStatus';

export class Order {
  private _status: OrderStatus = OrderStatus.PENDING;
  private _estimatedTimeInMinutes?: number;

  private static readonly SERVICE_FEE = new Price(2.5);
  private static readonly PRICE_PER_KM = 1.2;

  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly restaurantId: string,
    private _items: Consumable[],
    public readonly restaurantLocation: Coordinates,
    public readonly clientLocation: Coordinates,
    public readonly tipAmount: Price = new Price(0),
  ) {
    this.validateOrder();
  }

  private validateOrder(): void {
    if (this._items.length === 0) {
      throw new Error('Une commande doit contenir au moins un article.');
    }
  }

  public accept(minutes: number): void {
    if (this._status !== OrderStatus.PAID) {
      throw new Error('Seule une commande payée peut être acceptée.');
    }
    this._estimatedTimeInMinutes = minutes;
    this._status = OrderStatus.ACCEPTED;
  }

  get estimatedTime(): number | undefined {
    return this._estimatedTimeInMinutes;
  }

  public calculateTotal(): number {
    const subTotal = this.calculateItemsSubTotal();
    const deliveryFees = this.calculateDeliveryFees();

    const finalAmount =
      subTotal + deliveryFees + Order.SERVICE_FEE.value + this.tipAmount.value; // Ajout du pourboire ici !

    return Number(finalAmount.toFixed(2));
  }

  private calculateItemsSubTotal(): number {
    return this._items.reduce(
      (totalAccumulator, consumable) =>
        totalAccumulator + consumable.getFinalPrice().value,
      0,
    );
  }

  private calculateDeliveryFees(): number {
    const distance = new DeliveryDistance(
      this.restaurantLocation,
      this.clientLocation,
    );
    const distanceInKm = distance.getInKilometers();
    return distanceInKm * Order.PRICE_PER_KM;
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

  public updateStatus(newStatus: OrderStatus): void {
    if (this.isFinalState()) {
      throw new Error(
        'Impossible de modifier le statut de cette commande (${this._status})',
      );
    }

    this._status = newStatus;
  }

  private isFinalState(): boolean {
    return (
      this._status === OrderStatus.DELIVERED ||
      this._status === OrderStatus.CANCELLED
    );
  }
}

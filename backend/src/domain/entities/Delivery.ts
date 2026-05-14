import { Location } from '../value-objects/Location';
import { Wallet } from '../value-objects/Wallet';

export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';

export class Delivery {
  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly restaurantId: string,
    public readonly pickupLocation: Location,
    public readonly dropoffLocation: Location,
    public readonly distanceKm: number,
    public readonly tipEur: number,
    private readonly _status: DeliveryStatus,
    public readonly courierId: string | null,
  ) {}

  static create(params: {
    id: string;
    orderId: string;
    restaurantId: string;
    pickupLocation: Location;
    dropoffLocation: Location;
    tipEur: number;
  }): Delivery {
    const distanceKm = params.pickupLocation.calculateDistanceKmTo(
      params.dropoffLocation,
    );

    return new Delivery(
      params.id,
      params.orderId,
      params.restaurantId,
      params.pickupLocation,
      params.dropoffLocation,
      distanceKm,
      params.tipEur,
      'PENDING',
      null,
    );
  }

  get status(): DeliveryStatus {
    return this._status;
  }

  get earnings(): number {
    return Wallet.calculateDeliveryEarnings(this.distanceKm, this.tipEur);
  }

  assignTo(courierId: string): Delivery {
    if (this._status !== 'PENDING') {
      throw new Error(
        `Impossible d'assigner la livraison ${this.id} : statut actuel "${this._status}".`,
      );
    }
    return new Delivery(
      this.id, this.orderId, this.restaurantId,
      this.pickupLocation, this.dropoffLocation,
      this.distanceKm, this.tipEur,
      'ASSIGNED', courierId,
    );
  }

  markAsPickedUp(): Delivery {
    if (this._status !== 'ASSIGNED') {
      throw new Error(
        `Impossible de marquer comme collectée : statut actuel "${this._status}".`,
      );
    }
    return new Delivery(
      this.id, this.orderId, this.restaurantId,
      this.pickupLocation, this.dropoffLocation,
      this.distanceKm, this.tipEur,
      'PICKED_UP', this.courierId,
    );
  }

  markAsDelivered(): Delivery {
    if (this._status !== 'PICKED_UP') {
      throw new Error(
        `Impossible de marquer comme livrée : statut actuel "${this._status}".`,
      );
    }
    return new Delivery(
      this.id, this.orderId, this.restaurantId,
      this.pickupLocation, this.dropoffLocation,
      this.distanceKm, this.tipEur,
      'DELIVERED', this.courierId,
    );
  }

  static reconstitute(params: {
    id: string;
    orderId: string;
    restaurantId: string;
    pickupLocation: Location;
    dropoffLocation: Location;
    distanceKm: number;
    tipEur: number;
    status: DeliveryStatus;
    courierId: string | null;
  }): Delivery {
    return new Delivery(
      params.id,
      params.orderId,
      params.restaurantId,
      params.pickupLocation,
      params.dropoffLocation,
      params.distanceKm,
      params.tipEur,
      params.status,
      params.courierId,
    );
  }
}
import { Coordinates } from '../value-objects/DeliveryDistance';

export class Restaurant {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public name: string,
    public location: Coordinates,
    public isOpen: boolean = true
  ) {}

  public close(): void { this.isOpen = false; }
  public open(): void { this.isOpen = true; }
}
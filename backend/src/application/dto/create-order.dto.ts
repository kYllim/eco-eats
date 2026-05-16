import { Coordinates } from '../../domain/value-objects/DeliveryDistance';

export interface CreateOrderDTO {
  clientId: string;
  restaurantId: string;
  itemIds: string[];
  clientLocation: Coordinates;
}

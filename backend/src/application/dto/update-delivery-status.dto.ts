import { OrderStatus } from '../../domain/value-objects/OrderStatus';

export interface UpdateDeliveryStatusDTO {
  status: OrderStatus;
}

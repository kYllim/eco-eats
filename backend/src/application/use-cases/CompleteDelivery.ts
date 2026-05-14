import type {
  ICourierRepository,
  IDeliveryRepository,
} from '../../domain/ports/repositories';
import { Delivery } from '../../domain/entities/Delivery';

export interface CompleteDeliveryCommand {
  deliveryId: string;
}

export class CompleteDelivery {
  constructor(
    private readonly courierRepository: ICourierRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(command: CompleteDeliveryCommand): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(command.deliveryId);

    if (!delivery) {
      throw new Error(`Livraison introuvable : ${command.deliveryId}`);
    }

    if (!delivery.courierId) {
      throw new Error(
        `La livraison ${command.deliveryId} n'a pas de livreur assigné.`,
      );
    }

    const courier = await this.courierRepository.findById(delivery.courierId);

    if (!courier) {
      throw new Error(`Livreur introuvable : ${delivery.courierId}`);
    }

    const pickedUpDelivery = delivery.markAsPickedUp();
    const completedDelivery = pickedUpDelivery.markAsDelivered();

    const updatedCourier = courier.completeDelivery(
      command.deliveryId,
      completedDelivery.earnings,
    );

    await this.deliveryRepository.save(completedDelivery);
    await this.courierRepository.save(updatedCourier);

    return completedDelivery;
  }
}
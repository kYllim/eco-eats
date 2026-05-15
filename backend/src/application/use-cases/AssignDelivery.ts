import type {
  ICourierRepository,
  IDeliveryRepository,
} from '../../domain/ports/repositories';
import { Delivery } from '../../domain/entities/Delivery';
import { Location } from '../../domain/value-objects/Location';
import { Result } from '../../domain/shared/result';

export interface AssignDeliveryCommand {
  deliveryId: string;
  orderId: string;
  restaurantId: string;
  courierId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  tipEur: number;
}

export class AssignDelivery {
  constructor(
    private readonly courierRepository: ICourierRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(command: AssignDeliveryCommand): Promise<Result<Delivery>> {
    try {
      const existing = await this.deliveryRepository.findById(
        command.deliveryId,
      );
      if (existing)
        return Result.fail<Delivery>(
          `Livraison déjà existante : ${command.deliveryId}`,
        );

      const courier = await this.courierRepository.findById(command.courierId);
      if (!courier)
        return Result.fail<Delivery>(
          `Livreur introuvable : ${command.courierId}`,
        );

      if (!courier.canAcceptDelivery(command.restaurantId)) {
        return Result.fail<Delivery>(
          `Le livreur ${courier.name} ne peut pas accepter cette livraison.`,
        );
      }

      const pickupLocation = Location.create(
        command.pickupLatitude,
        command.pickupLongitude,
      );

      const dropoffLocation = Location.create(
        command.dropoffLatitude,
        command.dropoffLongitude,
      );

      const delivery = Delivery.create({
        id: command.deliveryId,
        orderId: command.orderId,
        restaurantId: command.restaurantId,
        pickupLocation,
        dropoffLocation,
        tipEur: command.tipEur,
      });

      const assignedDelivery = delivery.assignTo(command.courierId);
      const updatedCourier = courier.assignDelivery(
        command.deliveryId,
        command.restaurantId,
      );

      await this.deliveryRepository.save(assignedDelivery);
      await this.courierRepository.save(updatedCourier);

      return Result.ok(assignedDelivery);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail<Delivery>(
        message ?? "Erreur inconnue lors de l'assignation",
      );
    }
  }
}

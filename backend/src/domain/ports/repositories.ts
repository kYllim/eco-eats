import { Courier } from '../entities/Courier';
import { Delivery } from '../entities/Delivery';
import { Message } from '../entities/Message';

export interface ICourierRepository {
  findById(id: string): Promise<Courier | null>;
  findAvailable(): Promise<Courier[]>;
  save(courier: Courier): Promise<void>;
}

export interface IDeliveryRepository {
  findById(id: string): Promise<Delivery | null>;
  findPending(): Promise<Delivery[]>;
  save(delivery: Delivery): Promise<void>;
}

export interface IMessageRepository {
  findPrivateHistory(userIdA: string, userIdB: string): Promise<Message[]>;
  findGroupHistory(roomId: string): Promise<Message[]>;
  save(message: Message): Promise<void>;
}
import { Courier } from '../entities/Courier';
import { Delivery } from '../entities/Delivery';
import { Message } from '../entities/Message';
import { Consumable } from '../entities/Consumable';

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

export interface ICourierRepository {
  findById(id: string): Promise<any | null>;
  save(courier: any): Promise<void>;
}

export interface IDeliveryRepository {
  findById(id: string): Promise<any | null>;
  save(delivery: any): Promise<void>;
}

export interface IMessageRepository {
  save(message: any): Promise<void>;
  //findByConversationId(conversationId: string): Promise<any[]>;
}

export interface IConsumableRepository {
  findById(id: string): Promise<Consumable | null>;
  save(consumable: Consumable): Promise<void>;
  update?(id: string, data: any): Promise<Consumable>;
  remove?(id: string): Promise<void>;
}

export interface IRestaurantRepository {
  findById(id: string): Promise<any | null>;
}

export interface IOrderRepository {
  save(order: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findByClientId(clientId: string): Promise<any[]>;
}

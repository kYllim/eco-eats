/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { PrismaOrderRepository } from './sql/PrismaOrderRepository';
import { PrismaRestaurantRepository } from './sql/PrismaRestaurantRepository';
import { PrismaConsumableRepository } from './sql/PrismaConsumableRepository';
import { Order } from '../../domain/entities/Order';
import { Restaurant } from '../../domain/entities/Restaurant';
import { Consumable } from '../../domain/entities/Consumable';
import { Price } from '../../domain/value-objects/Price';
import { OrderStatus } from '../../domain/value-objects/OrderStatus';

/**
 * Integration tests for Prisma repositories.
 * These tests verify the mapping between domain entities and Prisma models.
 * Note: These tests use mock Prisma operations. For full integration tests with real database,
 * set up a test database with Docker or use an in-memory SQLite alternative.
 */

describe('Prisma Repositories Integration Tests', () => {
  // Mock Prisma Service
  const createMockPrismaService = () => ({
    order: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    restaurant: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    consumable: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  });

  describe('PrismaOrderRepository', () => {
    let prismaService: any;
    let orderRepository: PrismaOrderRepository;

    beforeEach(() => {
      prismaService = createMockPrismaService();
      orderRepository = new PrismaOrderRepository(prismaService);
    });

    test('should save order with correct mapping', async () => {
      const item = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        '',
        'rest-1',
        10,
      );

      const order = new Order(
        'order-1',
        'client-1',
        'rest-1',
        [item],
        { latitude: 48.85, longitude: 2.35 },
        { latitude: 48.86, longitude: 2.36 },
      );

      prismaService.order.upsert.mockResolvedValue({
        id: 'order-1',
        clientId: 'client-1',
        restaurantId: 'rest-1',
        status: OrderStatus.PENDING,
      });

      await orderRepository.save(order);

      expect(prismaService.order.upsert).toHaveBeenCalled();
      const callArgs = prismaService.order.upsert.mock.calls[0][0];
      expect(callArgs.create.id).toBe('order-1');
      expect(callArgs.create.clientId).toBe('client-1');
      expect(callArgs.create.restaurantId).toBe('rest-1');
    });

    test('should find order by id with correct mapping', async () => {
      const mockOrderRow = {
        id: 'order-1',
        clientId: 'client-1',
        restaurantId: 'rest-1',
        status: OrderStatus.PENDING,
        tipEur: 0,
        totalEur: 20,
        items: ['item-1'],
        clientLatitude: 48.86,
        clientLongitude: 2.36,
      };

      const mockRestaurantRow = {
        id: 'rest-1',
        latitude: 48.85,
        longitude: 2.35,
      };

      const mockConsumableRow = {
        id: 'item-1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 15,
        restaurantId: 'rest-1',
        stock: 10,
      };

      prismaService.order.findUnique.mockResolvedValue(mockOrderRow);
      prismaService.restaurant.findUnique.mockResolvedValue(mockRestaurantRow);
      prismaService.consumable.findMany.mockResolvedValue([mockConsumableRow]);

      const foundOrder = await orderRepository.findById('order-1');

      expect(foundOrder).not.toBeNull();
      expect(foundOrder?.id).toBe('order-1');
      expect(foundOrder?.clientId).toBe('client-1');
      expect(foundOrder?.restaurantId).toBe('rest-1');
      expect(foundOrder?.items.length).toBe(1);
    });

    test('should return null when order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      const foundOrder = await orderRepository.findById('nonexistent-id');

      expect(foundOrder).toBeNull();
    });

    test('should find orders by client id', async () => {
      const mockOrderRow = {
        id: 'order-1',
        clientId: 'client-1',
        restaurantId: 'rest-1',
        status: OrderStatus.PENDING,
        tipEur: 0,
        totalEur: 20,
        items: ['item-1'],
        clientLatitude: 48.86,
        clientLongitude: 2.36,
      };

      const mockRestaurantRow = {
        id: 'rest-1',
        latitude: 48.85,
        longitude: 2.35,
      };

      const mockConsumableRow = {
        id: 'item-1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 15,
        restaurantId: 'rest-1',
        stock: 10,
      };

      prismaService.order.findMany.mockResolvedValue([mockOrderRow]);
      prismaService.restaurant.findMany.mockResolvedValue([mockRestaurantRow]);
      prismaService.consumable.findMany.mockResolvedValue([mockConsumableRow]);

      const orders = await orderRepository.findByClientId('client-1');

      expect(orders).toHaveLength(1);
      expect(orders[0].clientId).toBe('client-1');
    });
  });

  describe('PrismaRestaurantRepository', () => {
    let prismaService: any;
    let restaurantRepository: PrismaRestaurantRepository;

    beforeEach(() => {
      prismaService = createMockPrismaService();
      restaurantRepository = new PrismaRestaurantRepository(prismaService);
    });

    test('should save restaurant with correct mapping', async () => {
      const restaurant = new Restaurant(
        'rest-1',
        'owner-1',
        'Restaurant Test',
        { latitude: 48.85, longitude: 2.35 },
      );

      prismaService.restaurant.upsert.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
        name: 'Restaurant Test',
      });

      await restaurantRepository.save(restaurant);

      expect(prismaService.restaurant.upsert).toHaveBeenCalled();
      const callArgs = prismaService.restaurant.upsert.mock.calls[0][0];
      expect(callArgs.create.id).toBe('rest-1');
      expect(callArgs.create.ownerId).toBe('owner-1');
      expect(callArgs.create.name).toBe('Restaurant Test');
    });

    test('should find restaurant by id with correct mapping', async () => {
      const mockRestaurantRow = {
        id: 'rest-1',
        ownerId: 'owner-1',
        name: 'Restaurant Test',
        latitude: 48.85,
        longitude: 2.35,
        isOpen: true,
      };

      prismaService.restaurant.findUnique.mockResolvedValue(mockRestaurantRow);

      const foundRestaurant = await restaurantRepository.findById('rest-1');

      expect(foundRestaurant).not.toBeNull();
      expect(foundRestaurant?.id).toBe('rest-1');
      expect(foundRestaurant?.ownerId).toBe('owner-1');
      expect(foundRestaurant?.name).toBe('Restaurant Test');
    });

    test('should return null when restaurant not found', async () => {
      prismaService.restaurant.findUnique.mockResolvedValue(null);

      const foundRestaurant =
        await restaurantRepository.findById('nonexistent-id');

      expect(foundRestaurant).toBeNull();
    });
  });

  describe('PrismaConsumableRepository', () => {
    let prismaService: any;
    let consumableRepository: PrismaConsumableRepository;

    beforeEach(() => {
      prismaService = createMockPrismaService();
      consumableRepository = new PrismaConsumableRepository(prismaService);
    });

    test('should save consumable with correct mapping', async () => {
      const consumable = new Consumable(
        'item-1',
        'Pizza',
        'Delicious pizza',
        [],
        new Price(15),
        'Main',
        'image.jpg',
        'rest-1',
        10,
      );

      prismaService.consumable.upsert.mockResolvedValue({
        id: 'item-1',
        name: 'Pizza',
      });

      await consumableRepository.save(consumable);

      expect(prismaService.consumable.upsert).toHaveBeenCalled();
      const callArgs = prismaService.consumable.upsert.mock.calls[0][0];
      expect(callArgs.create.id).toBe('item-1');
      expect(callArgs.create.name).toBe('Pizza');
      expect(callArgs.create.price).toBe(15);
    });

    test('should find consumable by id with correct mapping', async () => {
      const mockConsumableRow = {
        id: 'item-1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 15,
        restaurantId: 'rest-1',
        stock: 10,
        category: 'Main',
        imageUrl: 'image.jpg',
        allergens: [],
      };

      prismaService.consumable.findUnique.mockResolvedValue(mockConsumableRow);

      const foundConsumable = await consumableRepository.findById('item-1');

      expect(foundConsumable).not.toBeNull();
      expect(foundConsumable?.id).toBe('item-1');
      expect(foundConsumable?.name).toBe('Pizza');
      expect(foundConsumable?.stock).toBe(10);
    });

    test('should find consumables by ids', async () => {
      const mockConsumableRows = [
        {
          id: 'item-1',
          name: 'Pizza',
          description: 'Delicious pizza',
          price: 15,
          restaurantId: 'rest-1',
          stock: 10,
          category: 'Main',
          imageUrl: 'image.jpg',
          allergens: [],
        },
        {
          id: 'item-2',
          name: 'Salad',
          description: 'Fresh salad',
          price: 8,
          restaurantId: 'rest-1',
          stock: 20,
          category: 'Sides',
          imageUrl: 'salad.jpg',
          allergens: [],
        },
      ];

      prismaService.consumable.findMany.mockResolvedValue(mockConsumableRows);

      const foundConsumables = await consumableRepository.findByIds([
        'item-1',
        'item-2',
      ]);

      expect(foundConsumables).toHaveLength(2);
      expect(foundConsumables[0].name).toBe('Pizza');
      expect(foundConsumables[1].name).toBe('Salad');
    });

    test('should return empty array when consumables not found', async () => {
      prismaService.consumable.findMany.mockResolvedValue([]);

      const foundConsumables = await consumableRepository.findByIds([
        'nonexistent-1',
      ]);

      expect(foundConsumables).toHaveLength(0);
    });

    test('should return null when consumable not found', async () => {
      prismaService.consumable.findUnique.mockResolvedValue(null);

      const foundConsumable =
        await consumableRepository.findById('nonexistent-id');

      expect(foundConsumable).toBeNull();
    });
  });
});

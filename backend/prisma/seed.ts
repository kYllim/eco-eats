import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding complet de la base de données EcoEats...');

  const tables = [
    'itemsOnCarts',
    'itemsOnOrders',
    'consumablesOnMenus',
    'prismaOrder',
    'prismaConsumable',
    'prismaMenu',
    'prismaCart',
    'prismaRestaurant',
    'prismaUser',
    'message',
    'delivery',
    'courier',
  ];

  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany();
    } catch (error) {
    }
  }

  await (prisma as any).prismaUser.createMany({
    data: [
      {
        id: 'client-1',
        email: 'client@esgi.fr',
        role: 'CLIENT',
        name: 'Paul Durand',
      },
      {
        id: 'owner-1',
        email: 'resto@esgi.fr',
        role: 'RESTAURANT_OWNER',
        name: 'Chef Jean',
      },
    ],
  });

  await (prisma as any).prismaRestaurant.create({
    data: {
      id: 'resto-1',
      ownerId: 'owner-1',
      name: 'Bistrot Éco-ESGI',
      latitude: 48.8566,
      longitude: 2.3522,
      isOpen: true,
      imageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    },
  });

  await (prisma as any).prismaCart.create({
    data: {
      id: 'cart-client-1',
      clientId: 'client-1',
      restaurantId: 'resto-1',
    },
  });

  await (prisma as any).prismaMenu.create({
    data: {
      id: 'menu-midi',
      name: 'Sélection Anti-Gaspi',
      restaurantId: 'resto-1',
    },
  });

  await (prisma as any).prismaConsumable.createMany({
    data: [
      {
        id: 'burger-01',
        name: 'Clean Burger Anti-Waste',
        description: 'Un super burger.',
        price: 8.5,
        stock: 10,
        category: 'Plat',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        restaurantId: 'resto-1',
        discountPercentage: 15,
        allergens: ['Gluten'],
      },
      {
        id: 'cookie-01',
        name: 'Cookie Rescapé',
        description: 'Délicieux cookie.',
        price: 2.0,
        stock: 15,
        category: 'Dessert',
        imageUrl: 'default-food.png',
        restaurantId: 'resto-1',
        discountPercentage: 0,
        allergens: ['Lait'],
      },
    ],
  });

  await (prisma as any).consumablesOnMenus.createMany({
    data: [
      { menuId: 'menu-midi', consumableId: 'burger-01' },
      { menuId: 'menu-midi', consumableId: 'cookie-01' },
    ],
  });

  await prisma.courier.createMany({
    data: [
      {
        id: 'courier-1',
        name: 'Jean Dupont',
        status: 'AVAILABLE',
        tier: 'STANDARD',
        walletBalance: 0,
        activeDeliveryIds: [],
        currentRestaurantId: null,
      },
      {
        id: 'courier-2',
        name: 'Marie Martin',
        status: 'AVAILABLE',
        tier: 'EXPERT',
        walletBalance: 15,
        activeDeliveryIds: [],
        currentRestaurantId: null,
      },
    ],
  });

  console.log('✅ Base de données initialisée avec toutes les images !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

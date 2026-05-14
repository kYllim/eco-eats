import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding...');

  await prisma.message.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.courier.deleteMany();

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
        walletBalance: 42.5,
        activeDeliveryIds: [],
        currentRestaurantId: null,
      },
      {
        id: 'courier-3',
        name: 'Paul Bernard',
        status: 'UNAVAILABLE',
        tier: 'STANDARD',
        walletBalance: 10,
        activeDeliveryIds: [],
        currentRestaurantId: null,
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        id: 'msg-1',
        senderId: 'courier-1',
        receiverId: 'moderator-1',
        content: "Bonjour, j'ai un problème avec ma livraison.",
        type: 'PRIVATE',
      },
      {
        id: 'msg-2',
        senderId: 'moderator-1',
        receiverId: 'courier-1',
        content: 'Bonjour Jean, je regarde ça tout de suite.',
        type: 'PRIVATE',
      },
      {
        id: 'msg-3',
        senderId: 'moderator-1',
        roomId: 'staff-room',
        content: 'Réunion staff ce soir à 18h.',
        type: 'GROUP',
      },
      {
        id: 'msg-4',
        senderId: 'admin-1',
        roomId: 'staff-room',
        content: 'OK, je suis dispo.',
        type: 'GROUP',
      },
    ],
  });

  console.log('✅ Seed terminé.');
  console.log('');
  console.log('Comptes de test :');
  console.log('  Livreur (user)     → courier-1 (Jean Dupont, STANDARD, dispo)');
  console.log('  Livreur expert     → courier-2 (Marie Martin, EXPERT, dispo)');
  console.log('  Livreur indispo    → courier-3 (Paul Bernard, STANDARD)');
  console.log('  Modérateur (staff) → moderator-1');
  console.log('  Admin (staff)      → admin-1');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// src/main.ts
import { InMemoryConsumableRepository } from './src/infrastructure/repositories/in-memory/consumable.in-memory.repository';
import { InMemoryOrderRepository } from './src/infrastructure/repositories/in-memory/order.in-memory.repository';
import { InMemoryRestaurantRepository } from './src/infrastructure/repositories/in-memory/restaurant.in-memory.repository';
import { CreateOrder } from  './src/application/use-cases/Ordering/CreateOrder';
import { PayOrder } from  './src/application/use-cases/Ordering/PayOrder';
import { Restaurant } from  './src/domain/entities/Restaurant';
import { Consumable } from './src/domain/entities/Consumable';
import { Price } from  './src/domain/value-objects/Price';

async function runDemo() {
    console.log("🚀 --- DÉMARRAGE DU TEST ECOEATS ---");

    const consumableRepo = new InMemoryConsumableRepository();
    const orderRepo = new InMemoryOrderRepository();
    const restaurantRepo = new InMemoryRestaurantRepository();

    const restaurant = new Restaurant(
        "resto-1", "owner-1", "Bistrot ESGI", 
        { latitude: 48.95, longitude: 2.90 }
    );
    await restaurantRepo.save(restaurant);

    const burger = new Consumable(
        "burger-1", "Clean Burger", "Le burger sans bugs",
        [], new Price(15), "Plat", "img.png", "resto-1", 10
    );
    await consumableRepo.save(burger);

        const createOrder = new CreateOrder(orderRepo, restaurantRepo, consumableRepo);
        const orderResult = await createOrder.execute({
        clientId: "karen-77",
        restaurantId: "resto-1",
        itemIds: ["burger-1"],
        clientLocation: { latitude: 48.96, longitude: 2.89 }
        });

        if (orderResult.isFailure) {
            console.error('Erreur création commande :', orderResult.error);
            return;
        }
        const order = orderResult.getValue();

        console.log(`✅ Commande créée ! Total avec livraison : ${order.calculateTotal()}€`);

        const payOrder = new PayOrder(orderRepo, consumableRepo);
        const payResult = await payOrder.execute(order.id);
        if (payResult.isFailure) {
            console.error('Erreur paiement :', payResult.error);
            return;
        }
        const invoice = payResult.getValue();

        console.log("📄 FACTURE GÉNÉRÉE :", invoice);
    
    const updatedBurger = await consumableRepo.findById("burger-1");
    console.log(`📉 Stock restant : ${updatedBurger?.stock}`);
}

runDemo().catch(console.error);
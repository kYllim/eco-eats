# Quiz — Clean Architecture & EcoEats Project

## Partie 1 : Clean Architecture (fondamentaux)

### Question 1
**Q:** Expliquez les 4 couches de la Clean Architecture. Quel est le sens du flux de dépendances ?

**A:** 
- Domain : entités métier, règles pures (pas de framework).
- Application : use-cases orchestrent la logique métier.
- Infrastructure : adaptateurs (Prisma, in-memory), implémentation des ports.
- Interface : contrôleurs (Express, Nest), routage HTTP.

Flux : les dépendances pointent vers l'intérieur. Les couches externes dépendent des couches internes, jamais l'inverse.

### Question 2
**Q:** Qu'est-ce qu'un use-case ? Donnez un exemple avec CreateOrder.

**A:**
Un use-case orchestre une action métier, reçoit des inputs (DTO), valide, exécute et retourne un résultat.

Exemple CreateOrder:
```typescript
execute(input: CreateOrderInput): Promise<Result<Order>>
```
- Reçoit: clientId, restaurantId, itemIds
- Valide: restaurant existe, consommables disponibles
- Crée: l'entité Order
- Retourne: Result monad (succès ou échec)

### Question 3
**Q:** Qu'est-ce qu'un Value Object ? Donnez deux exemples du projet.

**A:**
Un Value Object est immuable, identifié par ses attributs (pas par ID).

Exemples :
- `Price(amount: number)` : représente un prix.
- `DailyStock(quantity: number, lastRestocked: Date)` : représente le stock journalier.

### Question 4
**Q:** Expliquez le pattern Repository. Comment l'implémentons-nous avec Prisma et in-memory ?

**A:**
Repository abstraite une source de données (port). Les adaptateurs l'implémentent:
- `PrismaOrderRepository` : lit/écrit dans la DB Prisma.
- `InMemoryOrderRepository` : stocke en mémoire (tests).

Use-cases dépendent du port (interface), pas de l'implémentation.

### Question 5
**Q:** Comment un use-case retourne-t-il succès ou erreur ?

**A:**
Via le pattern Result monad :
```typescript
interface Result<T> {
  isSuccess: boolean;
  isFailure: boolean;
  getValue(): T;
  getError(): string;
}
```

Si `isFailure`, ne pas appeler `getValue()`.

---

## Partie 2 : Projet EcoEats

### Question 6
**Q:** Décrivez le flux complet d'une commande (CreateOrder → PayOrder → AssignDelivery → CompleteDelivery).

**A:**
1. **CreateOrder** : client choisit restaurant + consommables → crée Order.
2. **PayOrder** : débite wallet client, crédite restaurant.
3. **AssignDelivery** : assigne un livreur, crée Delivery.
4. **CompleteDelivery** : marque livraison complète, calcule gains livreur (tier STANDARD vs EXPERT).

### Question 7
**Q:** Qu'est-ce que DailyStock ? Pourquoi l'avons-nous implémenté ?

**A:**
`DailyStock` gère le stock journalier avec rotation :
- `quantity`: nombre d'articles.
- `lastRestocked`: date dernière réappro.

Raison: supporter "stock journalier" (reset chaque jour), différent du stock infini.

### Question 8
**Q:** Expliquez les tiers de livreurs (STANDARD vs EXPERT) et les règles de gains.

**A:**
- **STANDARD** : gagne prix livraison + pourboire.
- **EXPERT** : gagne prix livraison × 1.5 + pourboire × 1.2 (multiplicateurs appliqués).

Implémenté dans `Courier.calculateEarnings()`.

### Question 9
**Q:** Où se trouvent les DTO ? Combien en avons-nous ?

**A:**
DTOs dans : `src/application/dto/`

Actuellement : 1 DTO unique
- `create-order.dto.ts` : `CreateOrderInput`

(Les autres use-cases utilisent les mêmes interfaces ou inputs internes.)

### Question 10
**Q:** Quelle est la différence entre contrôleurs Express et Nest ? Où se trouvent-ils ?

**A:**
- **Express** : framework minimaliste, routing manuel via `registerRoutes.ts`.
  Localisation : `src/interface/controllers/express/`
  
- **Nest** : framework opinionné, décorateurs, modules, DI.
  Localisation : `src/interface/controllers/nest/`

Les deux coexistent, implémentent les mêmes endpoints.

### Question 11
**Q:** Décrivez `fullSimulation.ts` : qu'est-ce qu'il teste ?

**A:**
`fullSimulation.ts` :
- Crée utilisateurs (owner, client, courier).
- Crée restaurant via CreateRestaurant.
- Ajoute consommable via AddConsumable.
- Orchestre: CreateOrder → PayOrder → AssignDelivery → CompleteDelivery → SendMessage.
- Teste le flux métier complet en mémoire.

### Question 12
**Q:** Comment tester un use-case ? Donnez la structure d'un test unitaire.

**A:**
```typescript
describe('CreateOrderUseCase', () => {
  it('should create order when restaurant and consumables exist', async () => {
    // Arrange : mock repositories
    const orderRepo = new InMemoryOrderRepository();
    const uc = new CreateOrder(orderRepo, ...);
    
    // Act : exécute le use-case
    const result = await uc.execute(input);
    
    // Assert : vérifie le résultat
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBeDefined();
  });
});
```

---

## Partie 3 : Pratique & Implémentation

### Question 13
**Q:** Vous devez ajouter un nouveau use-case `UpdateConsumable`. Où le placez-vous et quels fichiers créez-vous ?

**A:**
Fichiers :
1. `src/domain/entities/Consumable.ts` : ajouter méthode `update()` si manquante.
2. `src/application/use-cases/Consumable/UpdateConsumable.ts` : implement UC.
3. `src/application/use-cases/Consumable/UpdateConsumable.spec.ts` : tests.
4. Contrôleurs Express & Nest : ajouter endpoint PATCH `/consumables/:id`.
5. Routes : `registerRoutes.ts` → ajouter route.

### Question 14
**Q:** Comment ajouter un nouveau contrôleur pour Express ? Donnez les étapes.

**A:**
1. Créer `src/interface/controllers/express/new.controller.ts`.
2. Exporter fonction `setupNewRoutes(router)`.
3. Dans `registerRoutes.ts`, importer et appeler `setupNewRoutes(app)`.
4. Structurer endpoints avec `app.post()`, `app.get()`, etc.

### Question 15
**Q:** Comment migrer un contrôleur du format Express au format Nest ?

**A:**
1. Créer `src/interface/controllers/nest/New.controller.ts`.
2. Utiliser décorateurs : `@Controller('/route')`, `@Post()`, `@Get()`, etc.
3. Injecter use-cases via DI (constructeur).
4. Retourner réponses (ou exceptions Nest).
5. Enregistrer dans `HttpModule` (ajouter au tableau `controllers`).

---

## Annexe : Commandes utiles

```bash
# Installer dépendances
npm ci

# Tests
npm test

# Lint
npm run lint

# Build
npm run build

# Simulation complète
npm run workflows:full
```

**Bonne chance à l'examen ! 🚀**

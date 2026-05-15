# Guide d'examen — EcoEats Backend

Vous serez interrogés à la fois sur le projet et sur vos connaissances en architecture logicielle.

Objectifs de l'évaluation:

- Connaître l'architecture Clean Architecture appliquée dans ce projet.
- Expliquer le rôle des couches `domain`, `application`, `infrastructure`, `interface`.
- Décrire le pattern Repository et comment il est implémenté (Prisma & In-memory).
- Exposer le déroulé d'un use-case (ex: CreateOrder → AssignDelivery → CompleteDelivery).
- Connaître les DTOs et Value Objects utilisés (ex: `create-order.dto.ts`, `DailyStock`, `Wallet`).

Questions types:

- Expliquez pourquoi les use-cases ne dépendent pas des frameworks.
- Où se trouvent les adaptateurs Prisma et comment fonctionnent-ils ?
- Décrivez comment fonctionne la rotation/journalisation du stock (DailyStock).
- Comment ajoute-t-on un nouveau contrôleur pour Express et pour Nest ?

Préparation recommandée:

- Relire `README.md` du projet.
- Parcourir les dossiers `src/domain`, `src/application`, `src/infrastructure`, `src/interface`.
- Passer en revue les tests unitaires dans `src/**/*.spec.ts`.

Bonne révision !

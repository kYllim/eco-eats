# Formation — Clean Architecture (résumé)

Tous les membres du groupe doivent maîtriser la Clean Architecture.

Principes clés:

- Séparer les responsabilités en couches bien définies: `domain`, `application`, `infrastructure`, `interface`.
- Règle de dépendance: les dépendances pointent vers l'intérieur (vers `domain`).
- Use-cases: logique métier orchestrée dans `application/UseCases`.
- Entités & Value Objects: `src/domain/Entities` et `src/domain/value-objects`.
- Adapters/Ports: les ports sont des interfaces; les adaptateurs (Prisma, in-memory) les implémentent.

Exercices pratiques:

- Identifier une feature et tracer son flux depuis l'API jusqu'au repository.
- Ajouter un nouveau use-case et écrire un test unitaire pour celui-ci.
- Implémenter un adaptateur in-memory et un adaptateur Prisma pour le même port.

Ressources:

- Lire `src/interface/README.md` pour les conventions des contrôleurs.
- Parcourir les tests dans `src/application/use-cases`.

Objectif: chaque membre doit pouvoir expliquer et implémenter un use-case complet.

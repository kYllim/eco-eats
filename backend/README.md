# EcoEats — Backend

Pré-requis
- Node.js >= 18
- Docker (optionnel, recommandé pour la base PostgreSQL)

Variables d'environnement
- Copier `.env.example` en `.env` et adapter `DATABASE_URL`.

Commandes utiles

- Générer le client Prisma:
```bash
npm run prisma:generate
```
- Appliquer le schéma Prisma à la base:
```bash
npm run prisma:push
```
- Exécuter le seed:
```bash
npm run prisma:seed
```
- Démarrer une base PostgreSQL via Docker Compose (depuis la racine du repo):
```bash
docker-compose up -d
```
- Tout enchaîner (générer, push, seed, démarrage en développement):
```bash
npm run start:all
```

Tests

```bash
npm test
```

Notes
- Le projet utilise le pattern "Result<T>" pour les use-cases critiques. Les contrôleurs et scripts d'initialisation traitent ce type et vérifient `isFailure` avant d'accéder à `getValue()`.
- Si vous rencontrez une erreur d'authentification lors de `prisma db push`, vérifiez que `DATABASE_URL` dans `.env` est correcte et que la base PostgreSQL est accessible.

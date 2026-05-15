# EcoEats

## Contexte

EcoEats, une start-up française ambitieuse, souhaite concurrencer les géants de la livraison de repas (UberEats, Deliveroo) en proposant une alternative éthique et transparente. La plateforme a pour objectif de connecter les **Clients**, les **Restaurateurs** et les **Livreurs** tout en garantissant une répartition équitable des revenus et une optimisation des trajets pour réduire l'empreinte carbone.

## Membres du groupe

| Prénom NOM |
|---|
| GUEPPOIS Karen |
| MOUKOKO NDONGO Victoire Dane |

## Structure du dépôt

```
.
├── backend/                  # API Node/TypeScript (NestJS + Express + Prisma + Socket.io)
│   ├── src/                  # Code domaine + application + infrastructure + interface
│   ├── prisma/               # Schéma, migrations, seed
│   ├── public/               # Pages HTML de test (chat livreur, staff)
│   ├── test/                 # Tests e2e
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # SPA React + Vite
│   ├── src/
│   └── package.json
├── docker-compose.yml        # Orchestration api + postgres
├── .env.example              # Template des variables d'env
├── .gitignore
└── README.md
```

## Fonctionnalités

### 1. Client (la commande)

#### Navigation et Panier
- En tant que client, je dois pouvoir parcourir les menus des restaurants disponibles.
- Je dois pouvoir constituer un panier. **Règle métier** : un panier ne peut contenir des articles que d'un seul restaurant à la fois. Si j'ajoute un article d'un autre restaurant, le système doit me proposer de vider le panier actuel ou d'annuler l'action.

#### Passage de commande
- Je dois pouvoir valider ma commande. Le prix total doit inclure le prix des plats, les frais de livraison (calculés en fonction de la distance à vol d'oiseau) et les frais de service de la plateforme.
- Une fois la commande payée (simulation), une facture détaillée est générée.

### 2. Restaurateur (la préparation)

#### Gestion du Menu
- En tant que restaurateur, je dois pouvoir ajouter, modifier ou supprimer des plats (nom, description, prix, allergènes).
- Je dois pouvoir définir un "Stock journalier" pour chaque plat. Si le stock est à 0, le plat n'est plus commandable.

#### Workflow de commande
- Je reçois les commandes en temps réel. Je dois pouvoir **Accepter** ou **Refuser** une commande.
- Si j'accepte, je dois indiquer un temps de préparation estimé. Une fois prêt, je change le statut de la commande à "Prête pour collecte".

### 3. Livreur (la logistique)

#### Attribution et Livraison
- En tant que livreur, je peux me déclarer "Disponible" ou "Indisponible".
- Je reçois des propositions de livraison (uniquement pour les commandes "Prêtes" ou en cours de préparation).

> **Règle métier** : un livreur ne peut accepter qu'une seule livraison à la fois (sauf s'il possède un statut "Expert", auquel cas il peut en cumuler deux du même restaurant).

#### Revenus
- À chaque livraison terminée, le portefeuille virtuel du livreur est crédité.
- Le montant est calculé selon une formule fixe : **prise en charge + prix au km + pourboire intégral du client**. La plateforme ne prend aucune commission sur la part du livreur.

### 4. Système de Discussion (WebSockets)

#### Discussion Privée
- En tant que client, je dois pouvoir contacter un livreur via messages privés en temps réel pour le suivi de ma livraison.

#### Discussion de Groupe
- Un canal de discussion réservé au Staff (restaurateurs et livreurs) permet d'échanger sur les problèmes globaux (météo, retards, etc.). Chaque rôle est distinctement identifié dans ce salon.

#### Indicateur d'activité
- Statut "En train d'écrire" affiché dans tous les canaux de discussion lorsqu'une personne tape un message.

### 5. Flux d'Actualités et Notifications (SSE)

- En tant que client, je peux consulter en temps réel les actualités (promos, nouveaux plats) créées par les restaurateurs.
- Je reçois une notification en temps réel lorsqu'un message m'est envoyé ou qu'une nouvelle actualité est publiée.

## Contraintes Techniques

- **Langage** : TypeScript (backend et frontend).
- **Clean Architecture** : séparation stricte Domain / Application / Interface / Infrastructure. Règle de dépendance respectée.
- **Plug & Play** : 2 adaptateurs persistance (in-memory + Prisma/PostgreSQL) et 2 frameworks backend (NestJS + Express).
- **Clean Code** : SOLID, nommage explicite, fonctions courtes à responsabilité unique, gestion d'erreurs typée ou `Result`.

## Démarrer le projet

Prérequis : Docker + Docker Compose.

> Le conteneur `api` lance **le serveur NestJS Part B** (chat WebSocket + endpoints REST livreur / messages). Pour exécuter le script de démo Part A (commande, paiement, facture), voir la section [Part A] plus bas.

```bash
# 1. Copier le template d'environnement
cp .env.example .env

# 2. (Optionnel) Éditer .env pour adapter les credentials
#    Les valeurs par défaut conviennent pour un usage local.

# 3. Lancer le stack
docker compose up --build
```

Le conteneur `api` (depuis `backend/`) :
1. génère le client Prisma,
2. applique les migrations (`prisma migrate deploy`),
3. lance le seed (`prisma db seed`),
4. démarre l'API NestJS sur `http://localhost:3000`.

Postgres est exposé sur le port hôte `5433` (mappé vers `5432` du conteneur).

> ⚠️ Le fichier `.env` est gitignored. Il **doit** exister à la racine du repo avant `docker compose up`, sinon les variables `${POSTGRES_USER}`, etc. seront vides.

### Pages de test (servies par Nest)

- http://localhost:3000/index.html — portail
- http://localhost:3000/courier.html — espace livreur (chat privé)
- http://localhost:3000/staff.html — espace staff (groupe + privés)

### Lancer le frontend React

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 par défaut
```

### Démarrer le backend en local (sans Docker)

```bash
cd backend
npm install
docker compose -f ../docker-compose.yml up db -d
export DATABASE_URL="postgresql://ecoeats:ecoeats@127.0.0.1:5433/ecoeats"
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

### Variante framework — Express (mêmes use cases)

```bash
cd backend
npm run start:express
# http://localhost:3001
```

````markdown
## Part A 

Le script `backend/main.ts` démontre les use cases Part A (création de commande, paiement, facture, gestion du stock). Il tourne **en standalone** (pas de Docker, pas de Postgres, repositories in-memory).

```bash
cd backend
npm run demo:karen
```

Sortie attendue :

```
🚀 --- DÉMARRAGE DU TEST ECOEATS ---
✅ Commande créée ! Total avec livraison : 19.1€
📄 FACTURE GÉNÉRÉE : { invoiceId: 'FACT-...', total: 19.1, client: 'karen-77', items: [...] }
📉 Stock restant : 9
```

Ce script n'est **pas** lancé automatiquement par `docker compose up` — il est délibérément séparé du serveur Nest pour éviter que le conteneur sorte au démarrage. C'est un harness de test rapide pour la Part A.
````


## Variables d'environnement

| Variable | Rôle | Valeur d'exemple |
|---|---|---|
| `POSTGRES_USER` | Compte Postgres créé par Docker | `ecoeats` |
| `POSTGRES_PASSWORD` | Mot de passe Postgres | `ecoeats` |
| `POSTGRES_DB` | Nom de la base | `ecoeats` |
| `DATABASE_URL` | URL de connexion utilisée par Prisma (`api` → `db`) | `postgresql://ecoeats:ecoeats@db:5432/ecoeats` |
| `PORT` | Port d'écoute de l'API Nest | `3000` |

`docker-compose.yml` interpole ces variables — aucun credential n'est en dur dans le code commité.

## Fixtures / Comptes de test

Le seed crée 3 livreurs, un modérateur et un admin (cf. `backend/prisma/seed.ts`).

| Identifiant | Rôle | Détail |
|---|---|---|
| `courier-1` | USER (livreur) | Jean Dupont, STANDARD, disponible |
| `courier-2` | USER (livreur expert) | Marie Martin, EXPERT, disponible |
| `courier-3` | USER (livreur) | Paul Bernard, STANDARD, indisponible |
| `moderator-1` | MODERATEUR | Modérateur staff |
| `admin-1` | ADMIN | Directeur de banque |

Pour relancer le seed manuellement :

```bash
cd backend
npx prisma db seed
```

## Endpoints

### REST (Nest)

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/couriers/deliveries` | Créer et assigner une livraison à un livreur |
| POST | `/couriers/deliveries/:id/complete` | Marquer une livraison comme livrée et créditer le portefeuille |
| GET | `/messages/private?userIdA=…&userIdB=…` | Historique du fil privé entre deux utilisateurs |
| GET | `/messages/group?roomId=staff-room` | Historique du salon staff |

### WebSocket

Namespace `/private` (`ws://localhost:3000/private?userId=<id>`)

| Événement | Sens | Payload |
|---|---|---|
| `history` | C → S | `{ peerId }` — demander l'historique |
| `history` | S → C | `Message[]` |
| `send_private_message` | C → S | `{ receiverId, content }` |
| `private_message` | S → C | `Message` (diffusé à sender + receiver) |
| `typing` / `stop_typing` | C ↔ C | `{ receiverId }` (relayé) |
| `user_typing` / `user_stop_typing` | S → C | `{ senderId }` |
| `error` | S → C | `{ message }` |

Namespace `/group` (`ws://localhost:3000/group?userId=<id>&role=MODERATOR|ADMIN`)

| Événement | Sens | Payload |
|---|---|---|
| `history` | S → C (auto) | `Message[]` |
| `send_group_message` | C → S | `{ content }` |
| `group_message` | S → C | `{ id, senderId, role, content, sentAt }` |
| `typing` / `stop_typing` | C ↔ C | (aucun) |

## Tests

```bash
cd backend
npm test                  # tests unitaires
npm run test:cov          # avec couverture
```

Les use cases sont testés contre les repositories **In-Memory** (sans Postgres, sans Nest, sans Docker).

## Arrêter & nettoyer

```bash
docker compose down            # arrête conteneurs
docker compose down -v         # arrête + supprime le volume Postgres (efface les données)
```

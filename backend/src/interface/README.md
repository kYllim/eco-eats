Structure du dossier `src/interface`

- `controllers/express/` : contrôleurs pour l'application Express (utilisés par `registerRoutes.ts`).
- `controllers/nest/` : contrôleurs pour l'application Nest (utilisés par `HttpModule`).
- `http/` : module d'intégration Nest pour l'API HTTP (contient `http.module.ts`).
- `routes/` : enregistre les routes Express via `registerRoutes.ts`.
- `websocket/` : gateways et module websocket.

But : séparer clairement les contrôleurs Express et Nest pour éviter les confusions.

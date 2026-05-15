import express, { Application } from 'express';
import { registerRoutes } from '../../../interface/routes/registerRoutes';

export function createExpressApp(): Application {
  const app = express();
  app.use(express.json());
  // registerRoutes is a local module function; suppress unsafe-call here

  registerRoutes(app);
  return app;
}

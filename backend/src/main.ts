import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`EcoEats Part B (Nest) listening on http://localhost:${port}`);
}

void bootstrap();

import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";
import { resolve } from "node:path";

import { AppModule } from "./app.module";

config({ path: resolve(__dirname, "../.env") });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: origins });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number.parseInt(process.env.API_PORT ?? "3001", 10);
  await app.listen(Number.isFinite(port) ? port : 3001);
}

void bootstrap();

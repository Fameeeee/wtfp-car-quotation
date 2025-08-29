import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // Allow configuring allowed origins via ALLOWED_ORIGINS env var (comma-separated).
  // If ALLOWED_ORIGINS is not set, mirror the request origin (flexible for mobile/testing).
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(',').map(s => s.trim()) : null;

  app.enableCors({
    origin: allowedOrigins
      ? function (origin, callback) {
          // allow non browser tools (curl) with no origin
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
          return callback(new Error('Not allowed by CORS'), false);
        }
      : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

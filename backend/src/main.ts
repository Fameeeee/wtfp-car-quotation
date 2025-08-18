import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://wtfp-car-quotation-gjlh0vtab-fameeeees-projects.vercel.app',
      'https://wtfp-car-quotation.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials:true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Trading Platform API')
    .setDescription(
      'API for trading platform with portfolios, positions, trades, and watchlists',
    )
    .setVersion('1.0')
    .addTag('Users', 'User management operations')
    .addTag('Sessions', 'Session management operations')
    .addTag('Portfolios', 'Portfolio management operations')
    .addTag('Positions', 'Position management operations')
    .addTag('Trades', 'Trade management operations')
    .addTag('Watchlists', 'Watchlist management operations')
    .addTag('Game Options', 'Game options management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
void bootstrap();

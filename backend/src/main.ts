import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const env = process.env.NODE_ENV || 'development';
  const logLevels: any = env === 'production'
    ? ['error', 'warn', 'log']
    : ['log', 'debug', 'error', 'warn', 'verbose'];

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: logLevels,
  });

  const configService = app.get(ConfigService);

  // Enable Trust Proxy for Nginx (Critical for Secure Cookies in Production)
  (app as any).set('trust proxy', 1);

  // Ensure uploads directory exists
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "wss:", "ws:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS configuration
  app.enableCors({
    origin: [
      'https://psicoaissist.com',
      'https://www.psicoaissist.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
    ],
  });

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Psychologist Assistant API')
      .setDescription('API for the psychologist assistant application')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication and authorization')
      .addTag('users', 'User management')
      .addTag('clients', 'Client management')
      .addTag('sessions', 'Therapeutic sessions')
      .addTag('reports', 'Reports and analytics')
      .addTag('ai', 'Artificial intelligence services')
      .addTag('payments', 'Payments and subscriptions')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Server running on port ${port}`);
  logger.log(`📚 API Docs available at /api/docs`);
}

bootstrap();

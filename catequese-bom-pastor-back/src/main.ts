import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDevelopment = (process.env.NODE_ENV || 'development') !== 'production';

  const frontendUrls = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map((url) => url.trim()).filter(Boolean)
    : [];

  const allowedOrigins = frontendUrls.length
    ? frontendUrls
    : [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:8080']
        .filter((url): url is string => Boolean(url && url.trim()))
        .map((url) => url.trim());

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests from non-browser clients (no Origin header).
      if (!origin) {
        return callback(null, true);
      }

      if (isDevelopment) {
        try {
          const parsedOrigin = new URL(origin);
          const isLocalhost = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
          if (isLocalhost) {
            return callback(null, true);
          }
        } catch {
          // Ignore malformed origins and continue with strict allowlist check.
        }
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Catequese Bom Pastor API')
    .setDescription('API para gestão de catequese')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('turmas', 'Gestão de turmas')
    .addTag('catequizandos', 'Gestão de catequizandos')
    .addTag('catequistas', 'Gestão de catequistas')
    .addTag('responsaveis', 'Gestão de responsáveis')
    .addTag('inscricoes', 'Gestão de inscrições')
    .addTag('pagamentos', 'Gestão de pagamentos')
    .addTag('materiais', 'Materiais didáticos')
    .addTag('documentos', 'Documentos')
    .addTag('cronograma', 'Cronograma de aulas')
    .addTag('calendario', 'Calendário de eventos')
    .addTag('galeria', 'Galeria de imagens')
    .addTag('musicas', 'Músicas')
    .addTag('loja', 'Lojinha')
    .addTag('pre-matriculas', 'Gestão de pré-matrículas')
    .addTag('uploads', 'Upload de arquivos')
    .addTag('dashboard', 'Dashboards')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}/api
    📚 Swagger documentation: http://localhost:${port}/api/docs
  `);
}

bootstrap();

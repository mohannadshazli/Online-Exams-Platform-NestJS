import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { updateGlobalConfig } from 'nestjs-paginate';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //For setting up pagination configuration
  updateGlobalConfig({
    defaultOrigin: undefined,
    defaultLimit: 20,
    defaultMaxLimit: 100,
  });

  //For setting up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Online Exams Platform')
    .setDescription('The Online Exams Platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  //For validating the incoming request data based on the DTOs
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

  //For removing password from the response
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  //For starting the application
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

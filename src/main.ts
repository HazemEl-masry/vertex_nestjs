import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filter/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
    Validation Pipe
  */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce(
          (acc, error) => {
            if (error.constraints) {
              acc[error.property] = Object.values(error.constraints)[0];
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: formattedErrors,
        });
      },
    }),
  );

  /*
    Handling other errors:
      * Prisma errors
      * Unexpected errors
  */
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

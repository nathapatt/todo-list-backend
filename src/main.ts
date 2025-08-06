import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Build DATABASE_URL from individual environment variables
function buildDatabaseUrl(): void {
  const dbHost = process.env.POSTGRES_HOST || 'localhost';
  const dbPort = process.env.POSTGRES_PORT || '5432';
  const dbName = process.env.POSTGRES_DB || 'tododb';
  const dbUser = process.env.POSTGRES_APP_USER || 'postgres';
  const dbPassword = process.env.POSTGRES_APP_PASSWORD || 'postgres';

  const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  // Set the DATABASE_URL environment variable
  process.env.DATABASE_URL = connectionString;

  console.log(
    `Database URL configured: postgresql://${dbUser}:***@${dbHost}:${dbPort}/${dbName}`,
  );
}

async function bootstrap() {
  // Build database connection string
  buildDatabaseUrl();

  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();

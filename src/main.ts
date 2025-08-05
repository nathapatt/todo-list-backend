import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // <--- Add this line
  // app.enableCors({
  //   // origin: 'http://localhost:5173', // ให้เฉพาะ Frontend localhost:5173 เข้าถึงได้
  //   credentials: true, // ถ้าใช้ cookie ให้ใส่ด้วย (optional)
  // });

  await app.listen(3000);
}
bootstrap();

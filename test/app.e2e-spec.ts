/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('API Integration Tests (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let todoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Clean database before tests
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('App Controller', () => {
    it('/users (GET) - should return empty users array', () => {
      return request(app.getHttpServer()).get('/users').expect(200).expect([]);
    });
  });

  describe('Auth Controller', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
    };

    it('/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'User registered successfully',
          );
          expect(res.body).toHaveProperty('userId');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          userId = res.body.userId;
        });
    });

    it('/auth/register (POST) - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(500); // Prisma will throw duplicate error
    });

    it('/auth/login (POST) - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('name', testUser.name);
          authToken = res.body.access_token;
        });
    });

    it('/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/auth/login (POST) - should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        })
        .expect(401);
    });
  });

  describe('Todo Controller', () => {
    const testTodo = {
      title: 'Test Todo',
      note: 'This is a test todo',
      timestamp: new Date().toISOString(),
      color: '#ff0000',
    };

    it('/todos (GET) - should require authentication', () => {
      return request(app.getHttpServer()).get('/todos').expect(401);
    });

    it('/todos (POST) - should require authentication', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .send(testTodo)
        .expect(401);
    });

    it('/todos (GET) - should return todos for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/todos (POST) - should create a new todo', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTodo)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', testTodo.title);
          expect(res.body).toHaveProperty('note', testTodo.note);
          expect(res.body).toHaveProperty('color', testTodo.color);
          expect(res.body).toHaveProperty('userId', userId);
          todoId = res.body.id;
        });
    });

    it('/todos/:id (PUT) - should update a todo', () => {
      const updatedTodo = {
        title: 'Updated Todo Title',
        note: 'Updated note',
      };

      return request(app.getHttpServer())
        .put(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedTodo)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', updatedTodo.title);
          expect(res.body).toHaveProperty('note', updatedTodo.note);
        });
    });

    it('/todos/:id (PUT) - should require authentication', () => {
      return request(app.getHttpServer())
        .put(`/todos/${todoId}`)
        .send({ title: 'Unauthorized update' })
        .expect(401);
    });

    it('/todos/:id (DELETE) - should require authentication', () => {
      return request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .expect(401);
    });

    it('/todos/:id (DELETE) - should delete a todo', () => {
      return request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', todoId);
        });
    });

    it('/todos/:id (DELETE) - should fail with non-existent todo', () => {
      return request(app.getHttpServer())
        .delete('/todos/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500); // Prisma will throw not found error
    });
  });
});

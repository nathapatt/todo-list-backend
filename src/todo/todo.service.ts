import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Todo } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TodoCreateInput, userId: string): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        title: data.title,
        note: data.note,
        timestamp: data.timestamp,
        color: data.color,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  // READ All Todos
  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  // READ One Todo by ID
  async getTodoById(id: string): Promise<Todo | null> {
    return this.prisma.todo.findUnique({ where: { id } });
  }

  // UPDATE Todo
  async updateTodo(id: string, data: Prisma.TodoUpdateInput): Promise<Todo> {
    return this.prisma.todo.update({
      where: { id },
      data,
    });
  }

  // DELETE Todo
  async deleteTodo(id: string): Promise<Todo> {
    return this.prisma.todo.delete({ where: { id } });
  }
}

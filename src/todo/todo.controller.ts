import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Todo, Prisma } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Todo[]> {
    return await this.todoService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTodoDto: Prisma.TodoCreateInput,
    @Request() req: ExpressRequest & { user: JwtPayload },
  ): Promise<Todo> {
    const userId = req.user.userId; // <-- ตอนนี้ type ปลอดภัยแล้ว
    return await this.todoService.create(createTodoDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: Prisma.TodoUpdateInput,
  ): Promise<Todo> {
    return await this.todoService.updateTodo(id, updateTodoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Todo> {
    return await this.todoService.deleteTodo(id);
  }
}

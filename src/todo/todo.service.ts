import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, EditTodoDto } from './dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  // Get the todo from DB using specific id
  async getTodoById(userId: number, todoId: number) {
    return await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });
  }

  // Create the the new todo entry in a DB with specified parameters
  async createTodo(userId: number, dto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: { userId, ...dto },
    });

    return todo;
  }

  // List all the todo's for the given lead from DB
  getTodos(userId: number) {
    return this.prisma.todo.findMany({
      where: {
        userId,
      },
    });
  }

  // Edit the todo information using todo Id
  async editTodoById(userId: number, todoId: number, dto: EditTodoDto) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    // Return an error, if there is no entry with given id or if the user is not the owner of the todo
    if (!todo || todo.userId != userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        ...dto,
      },
    });
  }

  // Delete the todo with the given id
  async deleteTodoById(userId: number, todoId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    // Return an error, if there is no entry with given id or if the user is not the owner of the todo
    if (!todo || todo.userId != userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
  }
}

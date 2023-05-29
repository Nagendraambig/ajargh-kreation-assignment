import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TodoService } from './todo.service';
import { getUser } from '../auth/decorator';
import { CreateTodoDto, EditTodoDto } from './dto/index';

@UseGuards(AuthGuard('jwt'))
@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  // Get todo information by id
  @Get(':id')
  getTodoById(
    @getUser('id', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) todoId: number,
  ) {
    return this.todoService.getTodoById(userId, todoId);
  }

  // Create / Add a new todo
  @Post('/')
  createTodo(
    @getUser('id', ParseIntPipe) userId: number,
    @Body() dto: CreateTodoDto,
  ) {
    return this.todoService.createTodo(userId, dto);
  }

  // List all the todos for the specific user
  @Get('/')
  getTodos(@getUser('id', ParseIntPipe) userId: number) {
    return this.todoService.getTodos(userId);
  }

  // Update the todo by id
  @Patch(':id')
  editTodoById(
    @getUser('id', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) todoId: number,
    @Body() dto: EditTodoDto,
  ) {
    return this.todoService.editTodoById(userId, todoId, dto);
  }

  // Delete the todo by id
  @Delete(':id')
  deleteTodoById(
    @getUser('id', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) todoId: number,
  ) {
    return this.todoService.deleteTodoById(userId, todoId);
  }
}

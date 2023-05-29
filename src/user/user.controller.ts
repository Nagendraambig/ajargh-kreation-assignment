import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

import { getUser } from '../auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // Get user information
  @Get('me')
  async getMe(@getUser() user: User) {
    return user;
  }

  // Edit User information
  @Patch('edit')
  async editUser(@getUser() user: User, @Body() dto: EditUserDto) {
    return this.userService.editUser(user.id, dto);
  }
}

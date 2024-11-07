import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body('email') email: string, @Body('name') name?: string) {
    return this.usersService.createUser(email, name);
  }
}

import { Controller, Get, Post, Body, UseFilters,Delete,Param,Patch,UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { GlobalExceptionFilter } from '../common/filters/http-exception.filter';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseFilters(GlobalExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUsers(): Promise<User[]> {

    return this.usersService.getAllUsers();
  }

  @Post('AddNewUser')
  @UseGuards(AuthGuard('jwt'))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  @Delete('DeleteUser/:identifier')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('identifier') identifier: string) {
  return this.usersService.deleteUser(identifier);
  }

  @Patch('UpdateUser/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.usersService.updateUser(id, updateUserDto);
  }
  
  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.usersService.login(email, password);
  }

}

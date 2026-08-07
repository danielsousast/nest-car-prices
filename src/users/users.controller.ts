import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { UserDto } from './dtos/use.dto';
import { AuthService } from './auth.service';
import { SigninUserDto } from './dtos/signin-user.dto';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // AuthService handles duplicate checks and password hashing before storage.
  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body.name, body.email, body.password);
  }

  // Returns the serialized user when the submitted credentials are valid.
  @Post('signin')
  signin(@Body() body: SigninUserDto) {
    return this.authService.signin(body.email, body.password);
  }

  @Get()
  findAll(@Query('email') email?: string) {
    if (email) {
      return this.usersService.findByEmail(email);
    }

    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }
}

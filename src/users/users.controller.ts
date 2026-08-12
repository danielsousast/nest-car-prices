import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { SigninUserDto } from './dtos/signin-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // AuthService handles duplicate checks and password hashing before storage.
  @Post('signup')
  async signup(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.name, body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('signout')
  signout(@Session() session: any) {
    session.userId = null;
  }

  // Returns the serialized user when the submitted credentials are valid.
  @Post('signin')
  async signin(@Body() body: SigninUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Get()
  findAll(@Query('email') email?: string) {
    if (email) {
      return this.usersService.findByEmail(email);
    }

    return this.usersService.findAll();
  }

  @Get("/me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return user;
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

import { IsEmail, IsString, MinLength } from 'class-validator';

export class SigninUserDto {
  // DTO validation runs before the request reaches AuthService.
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

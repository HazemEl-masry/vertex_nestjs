import { LoginAuthDto } from './login-auth.dto';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterAuthDto extends LoginAuthDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'confirm password' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  confirmPassword!: string;
}

import { Match } from 'src/common/decorators/match.decorator';
import { LoginAuthDto } from './login-auth.dto';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterAuthDto extends LoginAuthDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  username!: string;

  @Match('password')
  confirmPassword!: string;
}

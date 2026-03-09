import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  email!: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  @MinLength(8, { message: 'password is too short (min = 8)' })
  @MaxLength(20, { message: 'password is too long (max = 20)' })
  password!: string;
}

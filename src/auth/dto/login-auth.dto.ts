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
  @MinLength(8)
  @MaxLength(20)
  password!: string;
}

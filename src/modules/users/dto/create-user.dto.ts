import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // استيراد الـ Decorator
import { Match } from '../../../common/decorators/match.decorator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ahmed', description: 'The first name of the user' })
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiProperty({ example: 'Ali', description: 'The last name of the user' })
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @ApiProperty({
    example: 'ahmed@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    example: 'P@ssword123',
    description:
      'User password (min 8 chars, must include uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. Must contain uppercase, lowercase, and a number or special character',
  })
  password: string;

  @ApiProperty({
    example: 'P@ssword123',
    description: 'Must match the password field',
  })
  @IsNotEmpty({ message: 'Please confirm your password' })
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm: string;
}

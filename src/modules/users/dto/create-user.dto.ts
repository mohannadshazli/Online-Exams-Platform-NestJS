import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
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
    example: 'password123',
    description: 'User password (min 8 chars)',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'password123',
    description: 'Must match the password field',
  })
  @IsNotEmpty({ message: 'Please confirm your password' })
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm: string;
}

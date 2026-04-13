import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Nome',
    description: 'Nome do usuário',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
    minLength: 6,
  })
  @MinLength(6, {
    message: 'Senha deve ter no mínimo 6 caracteres',
  })
  password: string;
}

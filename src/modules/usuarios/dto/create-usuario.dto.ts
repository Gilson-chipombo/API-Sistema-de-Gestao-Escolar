import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'joao@escola.ao' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: PerfilUsuario })
  @IsEnum(PerfilUsuario)
  perfil: PerfilUsuario;
}

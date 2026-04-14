import { IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCursoDto {
  @ApiProperty({ example: 'INF' }) @IsString() sigla_curso: string;
  @ApiProperty({ example: 'Curso de Informática' }) @IsString() descricao_curso: string;
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}

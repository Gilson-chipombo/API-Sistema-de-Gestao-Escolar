import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCursoDto {
  @ApiProperty({ example: 'INF' }) @IsString() sigla_curso: string;
  @ApiProperty({ example: 'Curso de Informática' }) @IsString() descricao_curso: string;
  @ApiProperty({ example: 6, required: false }) @IsOptional() @IsInt() @Type(() => Number) duracao_semestres?: number;
  @ApiProperty({ example: [1, 2, 3], required: false }) @IsOptional() @IsArray() @Type(() => Number) disciplinasIds?: number[];
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}

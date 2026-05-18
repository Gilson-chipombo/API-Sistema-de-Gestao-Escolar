import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCursoDto {
  @ApiProperty({ example: 'INF' })
  @IsString()
  sigla_curso: string;

  @ApiProperty({ example: 'Curso de Informática' })
  @IsString()
  descricao_curso: string;

  @ApiPropertyOptional({ example: 6, description: 'Duração em semestres' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  duracao_semestres?: number;

  @ApiPropertyOptional({ example: 'Formar profissionais na área de TI' })
  @IsOptional()
  @IsString()
  objetivo_curso?: string;
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}

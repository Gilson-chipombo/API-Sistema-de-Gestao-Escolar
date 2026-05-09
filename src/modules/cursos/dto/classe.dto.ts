import { IsString, IsOptional, IsInt, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoEnsino } from '@prisma/client';

export class CreateClasseDto {
  @ApiProperty({ example: 'INF' })
  @IsString()
  sigla_classe: string;

  @ApiProperty({ example: 'Classe de Informática' })
  @IsString()
  descricao_classe: string;

  @ApiPropertyOptional({ example: 'Informática', description: 'Nome do curso (para ensino médio)' })
  @IsOptional()
  @IsString()
  nomeCurso?: string;

  @ApiPropertyOptional({ example: 6, description: 'Duração em semestres' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  duracao_semestres?: number;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'IDs das disciplinas a associar' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  disciplinasIds?: number[];

  @ApiPropertyOptional({ enum: TipoEnsino, example: 'MEDIO' })
  @IsOptional()
  @IsEnum(TipoEnsino)
  tipoEnsino?: TipoEnsino;
}

export class UpdateClasseDto extends PartialType(CreateClasseDto) {}

// Manter compatibilidade com código antigo
export class CreateCursoDto extends CreateClasseDto {}
export class UpdateCursoDto extends UpdateClasseDto {}

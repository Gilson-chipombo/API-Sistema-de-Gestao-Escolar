import { IsString, IsOptional, IsInt, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoEnsino } from '@prisma/client';

export class CreateClasseDto {
  @ApiProperty({ example: '10ª' })
  @IsString()
  sigla_classe: string;

  @ApiProperty({ example: 'Décima Classe A' })
  @IsString()
  descricao_classe: string;

  @ApiPropertyOptional({ enum: TipoEnsino, example: 'MEDIO' })
  @IsOptional()
  @IsEnum(TipoEnsino)
  tipoEnsino?: TipoEnsino;

  @ApiPropertyOptional({ example: 1, description: 'ID do curso (para ensino médio)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  curso_id?: number;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'IDs das disciplinas a associar' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  disciplinasIds?: number[];
}

export class UpdateClasseDto extends PartialType(CreateClasseDto) {}

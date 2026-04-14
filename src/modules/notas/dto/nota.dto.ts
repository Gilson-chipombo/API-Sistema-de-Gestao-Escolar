import { IsDate, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNotaDto {
  @ApiProperty() @IsInt() estudante_id: number;
  @ApiProperty() @IsInt() disciplina_id: number;
  @ApiProperty() @IsInt() turma_id: number;

  @ApiPropertyOptional({ description: 'Trimestre (1, 2 ou 3)', minimum: 1, maximum: 3 })
  @IsOptional() @IsNumber() @Min(1) @Max(3) trimestre_nota?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() data_nota?: Date;

  @ApiPropertyOptional({ description: 'Média de Avaliação Contínua (MAC)', minimum: 0, maximum: 20 })
  @IsOptional() @IsNumber() @Min(0) @Max(20) mac_notas?: number;

  @ApiPropertyOptional({ description: 'Prova Parcial (PP)', minimum: 0, maximum: 20 })
  @IsOptional() @IsNumber() @Min(0) @Max(20) pp_notas?: number;

  @ApiPropertyOptional({ description: 'Prova de Trimestre (PT)', minimum: 0, maximum: 20 })
  @IsOptional() @IsNumber() @Min(0) @Max(20) pt_notas?: number;

  @ApiPropertyOptional({ example: 2025 }) @IsOptional() @IsInt() ano_letivo?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class UpdateNotaDto extends PartialType(CreateNotaDto) {}

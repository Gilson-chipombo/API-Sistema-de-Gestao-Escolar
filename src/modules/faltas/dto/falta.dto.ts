import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoFalta } from '@prisma/client';

export class CreateFaltaDto {
  @ApiProperty() @IsInt() estudante_id: number;
  @ApiProperty() @IsInt() disciplina_id: number;
  @ApiProperty() @IsInt() turma_id: number;
  @ApiProperty() @Type(() => Date) @IsDate() data_falta: Date;
  @ApiProperty({ enum: TipoFalta }) @IsEnum(TipoFalta) tipo_falta: TipoFalta;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class UpdateFaltaDto extends PartialType(CreateFaltaDto) {}

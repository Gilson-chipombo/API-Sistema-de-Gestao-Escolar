import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StatusEstudante } from '@prisma/client';

export class CreateEstudanteDto {
  @ApiProperty() @IsString() nome_estudante: string;
  @ApiProperty() @Type(() => Date) @IsDate() data_nascimento: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() nome_pai_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nome_mae_estudante?: string;
  @ApiProperty() @IsString() naturalidade_estudante: string;
  @ApiProperty() @IsString() numero_bi_estudante: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone_estudante?: string;
  @ApiProperty() @IsString() endereco_fisico_estudante: string;
  @ApiProperty() @IsInt() numero_matricula: number;
  @ApiProperty() @IsString() turno_estudante: string;
  @ApiProperty() @IsString() classe_estudante: string;
  @ApiProperty() @IsInt() turma_id: number;
  @ApiPropertyOptional() @IsOptional() @IsString() encarregado_estudante?: string;
  @ApiProperty({ enum: StatusEstudante }) @IsEnum(StatusEstudante) status: StatusEstudante;
}

export class UpdateEstudanteDto extends PartialType(CreateEstudanteDto) {}

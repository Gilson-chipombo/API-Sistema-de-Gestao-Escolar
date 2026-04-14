import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NivelAcademico, StatusProfessor } from '@prisma/client';

export class CreateProfessorDto {
  @ApiProperty() @IsString() nome_prof: string;
  @ApiPropertyOptional() @IsOptional() @IsString() filiacao_prof?: string;
  @ApiProperty() @Type(() => Date) @IsDate() data_nascimento_prof: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() email_prof?: string;
  @ApiProperty() @IsString() telefone_prof: string;
  @ApiProperty() @IsString() numero_bi_prof: string;
  @ApiProperty() @Type(() => Date) @IsDate() data_emissao_bi_prof: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() nacionalidade_prof?: string;
  @ApiProperty() @IsString() endereco_fisico_prof: string;
  @ApiProperty() @IsString() naturalidade_prof: string;
  @ApiProperty({ enum: NivelAcademico }) @IsEnum(NivelAcademico) nivel_academico: NivelAcademico;
  @ApiProperty() @IsString() area_formacao_prof: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() ano_conclusao_formacao?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() data_admissao?: Date;
  @ApiProperty({ enum: StatusProfessor }) @IsEnum(StatusProfessor) status: StatusProfessor;
  @ApiPropertyOptional() @IsOptional() @IsInt() usuario_id?: number;
}

export class UpdateProfessorDto extends PartialType(CreateProfessorDto) {}

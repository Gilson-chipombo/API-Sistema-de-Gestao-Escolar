import { IsDate, IsEnum, IsInt, IsOptional, IsString, IsEmail, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ type: 'array', items: { type: 'number' }, description: 'IDs das disciplinas' }) 
  @IsOptional() 
  @IsArray() 
  @IsInt({ each: true }) 
  disciplinas?: number[];
  @ApiPropertyOptional({ type: 'array', items: { type: 'number' }, description: 'IDs das turmas' }) 
  @IsOptional() 
  @IsArray() 
  @IsInt({ each: true }) 
  turmas?: number[];
}

export class CreateProfessorWithUserDto extends CreateProfessorDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
  @ApiPropertyOptional() @IsOptional() @IsString() user_name?: string;
}

export class UpdateProfessorDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome_prof?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() filiacao_prof?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() data_nascimento_prof?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() email_prof?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone_prof?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numero_bi_prof?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() data_emissao_bi_prof?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() nacionalidade_prof?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endereco_fisico_prof?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() naturalidade_prof?: string;
  @ApiPropertyOptional({ enum: NivelAcademico }) @IsOptional() @IsEnum(NivelAcademico) nivel_academico?: NivelAcademico;
  @ApiPropertyOptional() @IsOptional() @IsString() area_formacao_prof?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() ano_conclusao_formacao?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() data_admissao?: Date;
  @ApiPropertyOptional({ enum: StatusProfessor }) @IsOptional() @IsEnum(StatusProfessor) status?: StatusProfessor;
  @ApiPropertyOptional({ type: 'array', items: { type: 'number' }, description: 'IDs das disciplinas' }) 
  @IsOptional() 
  @IsArray() 
  @IsInt({ each: true }) 
  disciplinas?: number[];
  @ApiPropertyOptional({ type: 'array', items: { type: 'number' }, description: 'IDs das turmas' }) 
  @IsOptional() 
  @IsArray() 
  @IsInt({ each: true }) 
  turmas?: number[];
}

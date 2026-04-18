import { IsDate, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
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
  @ApiPropertyOptional() @IsOptional() @IsInt() turma_id?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() encarregado_estudante?: string;
  @ApiProperty({ enum: StatusEstudante }) @IsEnum(StatusEstudante) status: StatusEstudante;
}

// DTO para criar Estudante com usuário (para registro inicial)
export class CreateEstudanteWithUserDto extends CreateEstudanteDto {
  @ApiProperty() @IsString() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty() @IsString() user_name: string;
}

export class UpdateEstudanteDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() data_nascimento?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() nome_pai_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nome_mae_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() naturalidade_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numero_bi_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endereco_fisico_estudante?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() turma_id?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() encarregado_estudante?: string;
  @ApiPropertyOptional({ enum: StatusEstudante }) @IsOptional() @IsEnum(StatusEstudante) status?: StatusEstudante;
}

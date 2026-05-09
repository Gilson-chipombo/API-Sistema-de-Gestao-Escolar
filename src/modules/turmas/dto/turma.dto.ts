import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTurmaDto {
  @ApiProperty({ example: 'A' }) @IsString() sigla_turma: string;
  @ApiProperty({ example: 2025 }) @IsInt() ano_lectivo_turma: number;
  @ApiProperty({ example: 'Manhã' }) @IsString() turno_turma: string;
  @ApiProperty({ example: '10ª' }) @IsString() classe_turma: string;
  @ApiProperty({ example: 'Sala 5' }) @IsString() sala_turma: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() classe_id?: number;
  @ApiProperty({ description: 'ID do professor director de turma' }) @IsInt() diretor_turma: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() numero_aluno_turma?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes_turma?: string;
}

export class UpdateTurmaDto extends PartialType(CreateTurmaDto) {}

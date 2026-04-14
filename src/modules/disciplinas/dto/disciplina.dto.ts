import { IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateDisciplinaDto {
  @ApiProperty({ example: 'MAT' }) @IsString() sigla_disc: string;
  @ApiProperty({ example: 'Matemática' }) @IsString() descricao_disc: string;
}

export class UpdateDisciplinaDto extends PartialType(CreateDisciplinaDto) {}

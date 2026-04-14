import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DestinatarioAviso, PrioridadeAviso } from '@prisma/client';

export class CreateAvisoDto {
  @ApiProperty({ example: 'Reunião de pais' })
  @IsString() titulo: string;

  @ApiProperty({ example: 'A reunião de pais realizar-se-á no dia 20...' })
  @IsString() conteudo: string;

  @ApiPropertyOptional({ description: 'ID do professor/utilizador que publica' })
  @IsOptional() @IsInt() professor_id?: number;

  @ApiProperty({ enum: DestinatarioAviso })
  @IsEnum(DestinatarioAviso) destinatarios: DestinatarioAviso;

  @ApiProperty()
  @Type(() => Date) @IsDate() data_publicacao: Date;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Date) @IsDate() data_expiracao?: Date;

  @ApiProperty({ enum: PrioridadeAviso })
  @IsEnum(PrioridadeAviso) prioridade: PrioridadeAviso;
}

export class UpdateAvisoDto extends PartialType(CreateAvisoDto) {}

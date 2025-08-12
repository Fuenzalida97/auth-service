import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/user-role.enum';

export class FilterUserDto {
  @IsOptional()
  @IsNumberString()
  page?: number; // Página actual

  @IsOptional()
  @IsNumberString()
  limit?: number; // Límite de registros por página

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Filtrar por rol

  @IsOptional()
  @IsString()
  search?: string; // Buscar por nombre o email
}

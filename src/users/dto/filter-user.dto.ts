import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/user-role.enum';

export class FilterUserDto {
  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  search?: string;
}

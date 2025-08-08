import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from './enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplica guard de JWT y Roles a todo el controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Solo administradores pueden listar todos los usuarios
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Solo administradores pueden ver un usuario específico
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Cualquier usuario autenticado puede crear usuarios (incluyendo admins)
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  // Solo administradores pueden actualizar usuarios
  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  // Solo administradores pueden borrar usuarios
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

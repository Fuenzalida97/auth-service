import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña no debe estar vacía' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
  name: string;
}

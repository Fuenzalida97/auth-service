import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (userExists) {
        throw new ConflictException('El correo ya está registrado.');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const newUser = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(newUser);

      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      // Si ya es una excepción conocida, la relanzamos
      if (error instanceof ConflictException) {
        throw error;
      }

      // Aquí podrías personalizar aún más según el tipo de error
      console.error('Error en AuthService:', error);
      throw new InternalServerErrorException(
        'Error interno al registrar el usuario.',
      );
    }
  }
}

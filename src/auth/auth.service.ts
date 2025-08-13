import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/users.entity';
import { AuthProvider } from '../users/enums/user-authprovider.enum';
import { Role } from '../users/enums/user-role.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

type GoogleUserInput = {
  email: string;
  name: string;
  provider: AuthProvider; // GOOGLE
  providerId: string;
  avatar?: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /** Registro normal (email + password) */
  async register(dto: RegisterUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
      password: hashed,
      role: Role.USER,
      provider: AuthProvider.LOCAL,
    });

    await this.userRepo.save(user);
    return this.signFor(user);
  }

  /** Login normal (email + password) */
  async login(dto: LoginUserDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // Si el usuario es solo Google y no tiene password, no puede entrar por aquí
    if (user.provider !== AuthProvider.LOCAL || !user.password) {
      throw new UnauthorizedException('Debes iniciar sesión con Google');
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.signFor(user);
  }

  /** Login / alta con Google (vía GoogleAuthGuard) */
  async googleLoginOrRegister(googleUser: GoogleUserInput) {
    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    if (user) {
      // Si ya existía (LOCAL) pero aún no tenía providerId, lo vinculamos
      if (!user.providerId) {
        user.providerId = googleUser.providerId;
        await this.userRepo.save(user);
      }
      return this.signFor(user);
    }

    // Si no existe, lo creamos como GOOGLE (password null)
    user = this.userRepo.create({
      email: googleUser.email,
      name: googleUser.name,
      role: Role.USER,
      provider: AuthProvider.GOOGLE,
      providerId: googleUser.providerId,
      password: null,
    });

    await this.userRepo.save(user);
    return this.signFor(user);
  }

  /** Helper: genera el JWT y devuelve datos útiles */
  private async signFor(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
      },
    };
  }
}

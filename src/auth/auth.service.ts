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
  provider: AuthProvider;
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

  async login(dto: LoginUserDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (user.provider !== AuthProvider.LOCAL || !user.password) {
      throw new UnauthorizedException('Debes iniciar sesión con Google');
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.signFor(user);
  }

  async googleLoginOrRegister(googleUser: GoogleUserInput) {
    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    if (user) {
      if (!user.providerId) {
        user.providerId = googleUser.providerId;
        await this.userRepo.save(user);
      }
      return this.signFor(user);
    }

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

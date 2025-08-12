import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../users/entities/users.entity';
import { AuthProvider } from '../users/enums/user-authprovider.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from 'src/users/enums/user-role.enum';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /** Registro normal (correo + contraseña) */
  async register(registerDto: RegisterUserDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
      role: Role.USER,
    });

    await this.userRepository.save(newUser);
    return { message: 'Usuario registrado con éxito' };
  }

  /** Login normal (correo + contraseña) */
  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.provider !== AuthProvider.LOCAL || !user.password) {
      throw new UnauthorizedException('Debes iniciar sesión con Google');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  /** Login con Google */
  async loginWithGoogle(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Token de Google inválido');
    }

    const googleId = payload.sub;
    const email = payload.email;

    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // Si el usuario existe pero no tiene vinculado Google, lo vinculamos
      if (!user.providerId) {
        user.providerId = googleId;
        await this.userRepository.save(user);
      }
    } else {
      // Si no existe, lo creamos como usuario LOCAL pero con providerId de Google
      user = this.userRepository.create({
        email,
        provider: AuthProvider.LOCAL, // mantiene login normal disponible
        providerId: googleId,
        role: Role.USER,
      });
      await this.userRepository.save(user);
    }

    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return { accessToken };
  }
}

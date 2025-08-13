import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthProvider } from '../users/enums/user-authprovider.enum';

type GoogleUserFromGuard = {
  email: string;
  name: string;
  provider: AuthProvider; // vendrá como AuthProvider.GOOGLE
  providerId: string;
  avatar?: string | null;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  @UseGuards(GoogleAuthGuard)
  async google(@Req() req: Request) {
    const googleUser = req.user as GoogleUserFromGuard;
    return this.authService.googleLoginOrRegister(googleUser);
  }
}

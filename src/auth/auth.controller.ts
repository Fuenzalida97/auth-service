import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
  @Post('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle(@Body('idToken') idToken: string) {
    return this.authService.loginWithGoogle(idToken);
  }
}

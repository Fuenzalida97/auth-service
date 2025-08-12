import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthProvider } from '../../users/enums/user-authprovider.enum';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Google token no proporcionado');
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('Token de Google inválido');
      }

      // Agregamos los datos validados al request para usarlos en el controller
      request.user = {
        email: payload.email,
        name: payload.name || payload.given_name || '',
        provider: AuthProvider.GOOGLE,
        providerId: payload.sub, // ID único del usuario en Google
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Error validando token de Google');
    }
  }
}

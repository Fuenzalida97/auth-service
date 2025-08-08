import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Aquí podrías añadir lógica personalizada antes de la validación de JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Si el token es inválido o no existe, lanzamos error 401
      throw err || new UnauthorizedException('Token inválido o ausente');
    }
    return user; // Esto se inyecta en req.user
  }
}

import { Role } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

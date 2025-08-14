import { AuthProvider } from '../../users/enums/user-authprovider.enum';

export type GoogleUserFromGuard = {
  email: string;
  name: string;
  provider: AuthProvider;
  providerId: string;
  avatar?: string | null;
};

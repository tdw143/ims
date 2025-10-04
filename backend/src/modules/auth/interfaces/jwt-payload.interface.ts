// src/modules/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
}
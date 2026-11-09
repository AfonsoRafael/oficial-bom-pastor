import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { USER_ROLES, UserRole } from '../../../common/constants/user-roles';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: this.normalizeRole(payload.tipoUsuario ?? payload.role),
    };
  }

  private normalizeRole(role: string): UserRole {
    const normalized = String(role || '').toLowerCase().trim();
    if (normalized === 'admin' || normalized === 'administrador' || normalized === 'adminstrador') {
      return USER_ROLES.ADMINISTRADOR;
    }
    if (normalized === 'catequista' || normalized === 'catechist') {
      return USER_ROLES.CATEQUISTA;
    }
    return USER_ROLES.RESPONSAVEL;
  }
}

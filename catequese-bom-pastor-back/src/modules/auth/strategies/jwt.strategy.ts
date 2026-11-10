import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { isUserRole, UserRole } from '../../../common/constants/user-roles';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  perfis: UserRole[];
  tokenUse: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: AuthTokenPayload) {
    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      !/^[1-9]\d*$/.test(payload.sub) ||
      typeof payload.email !== 'string' ||
      !payload.email ||
      !Array.isArray(payload.perfis) ||
      payload.perfis.length === 0 ||
      !payload.perfis.every((perfil) => typeof perfil === 'string' && isUserRole(perfil)) ||
      payload.tokenUse !== 'access'
    ) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: payload.sub,
      email: payload.email,
      perfis: payload.perfis,
      role: payload.perfis.length === 1 ? payload.perfis[0] : undefined,
    };
  }
}

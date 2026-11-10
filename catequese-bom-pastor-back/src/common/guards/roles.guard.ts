import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../constants/user-roles';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

<<<<<<< HEAD:catequese-bom-pastor-back/src/common/guards/roles.guard.ts
    const authDisabled = process.env.DISABLE_AUTH === 'true';
=======
    const authDisabled = process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV !== 'production';
>>>>>>> origin/correcoes-afonso:back/src/common/guards/roles.guard.ts

    if (authDisabled) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = Array.isArray(user.perfis) && requiredRoles.some((role) => user.perfis.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(`User does not have required role. Required: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}

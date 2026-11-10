import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { USER_ROLES } from '../../../common/constants/user-roles';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		// Let CORS preflight pass through without authentication.
		if (request.method === 'OPTIONS') {
			return true;
		}

		// Auth is enabled by default. Set DISABLE_AUTH=true only for local/dev bypass.
		const authDisabled = process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV !== 'production';

		if (authDisabled) {
			request.user = request.user ?? {
				id: '1',
				email: 'dev@local',
				role: USER_ROLES.ADMINISTRADOR,
				perfis: [USER_ROLES.ADMINISTRADOR],
			};

			return true;
		}

		return super.canActivate(context);
	}
}

import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data === 'role' && Array.isArray(user?.perfis) && user.perfis.length !== 1) {
      throw new ForbiddenException('Esta operação ainda não suporta múltiplos perfis.');
    }

    return data ? user?.[data] : user;
  },
);

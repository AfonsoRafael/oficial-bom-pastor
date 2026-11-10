import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES } from '../constants/user-roles';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const handler = () => undefined;
  const controller = class {};
  const context = (user?: { perfis: string[] }): ExecutionContext => ({
    getHandler: jest.fn().mockReturnValue(handler),
    getClass: jest.fn().mockReturnValue(controller),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({ getRequest: () => ({ user }) }),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  });
  const originalDisabled = process.env.DISABLE_AUTH;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    Reflect.deleteMetadata(ROLES_KEY, handler);
    Reflect.deleteMetadata(IS_PUBLIC_KEY, handler);
    if (originalDisabled === undefined) delete process.env.DISABLE_AUTH;
    else process.env.DISABLE_AUTH = originalDisabled;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it('autoriza quando um dos perfis atende ao papel exigido', () => {
    Reflect.defineMetadata(ROLES_KEY, [USER_ROLES.COORDENADOR], handler);
    expect(guard.canActivate(context({ perfis: [USER_ROLES.RESPONSAVEL, USER_ROLES.COORDENADOR] }))).toBe(true);
    expect(() => guard.canActivate(context({ perfis: [USER_ROLES.RESPONSAVEL] }))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
  });

  it('mantém rotas públicas acessíveis', () => {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
    Reflect.defineMetadata(ROLES_KEY, [USER_ROLES.ADMINISTRADOR], handler);
    expect(guard.canActivate(context())).toBe(true);
  });

  it('não permite o bypass de autenticação em produção', () => {
    process.env.DISABLE_AUTH = 'true';
    process.env.NODE_ENV = 'production';
    Reflect.defineMetadata(ROLES_KEY, [USER_ROLES.ADMINISTRADOR], handler);
    expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
  });
});

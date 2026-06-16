import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Validar se as senhas coincidem (caso confirmSenha seja enviado)
    if (dto.confirmSenha && dto.senha !== dto.confirmSenha) {
      throw new BadRequestException('As senhas não coincidem');
    }

    // Verificar se email já existe
    const [existingAdmin, existingResponsavel, existingCatequista] = await Promise.all([
      this.prisma.administrador.findUnique({ where: { email: dto.email } }),
      this.prisma.responsavel.findUnique({ where: { email: dto.email } }),
      this.prisma.catequista.findUnique({ where: { email: dto.email } }),
    ]);

    if (existingAdmin || existingResponsavel || existingCatequista) {
      throw new ConflictException('Este email já está cadastrado');
    }

    // Mapear role do frontend para string
    let userRole: UserRole = USER_ROLES.RESPONSAVEL;
    if (dto.role) {
      const roleNormalized = String(dto.role).toLowerCase().trim();
      if (roleNormalized === 'admin' || roleNormalized === 'administrador' || roleNormalized === 'adminstrador') {
        userRole = USER_ROLES.ADMINISTRADOR;
      } else if (
        roleNormalized === 'responsavel' ||
        roleNormalized === 'responsável' ||
        roleNormalized === 'pai/mãe' ||
        roleNormalized === 'parent'
      ) {
        userRole = USER_ROLES.RESPONSAVEL;
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    // Criar usuário
    const legacyRole = this.toLegacyRole(userRole);

    if (userRole === USER_ROLES.ADMINISTRADOR) {
      const admin = await this.prisma.administrador.create({
        data: {
          email: dto.email,
          nome: dto.nome,
          telefone: dto.telefone,
          senha: hashedPassword,
        },
      });

      const tokens = await this.generateTokens(admin.id, admin.email, userRole);

      return {
        user: {
          id: admin.id,
          email: admin.email,
          nome: admin.nome,
          role: userRole,
          roleLegacy: legacyRole,
          tipoUsuario: userRole,
          primeiroAcesso: admin.primeiroAcesso,
        },
        ...tokens,
      };
    }

    const responsavel = await this.prisma.responsavel.create({
      data: {
        email: dto.email,
        nome: dto.nome,
        telefone: dto.telefone,
        senha: hashedPassword,
      },
    });

    const tokens = await this.generateTokens(responsavel.id, responsavel.email, userRole);

    return {
      user: {
        id: responsavel.id,
        email: responsavel.email,
        nome: responsavel.nome,
        role: userRole,
        roleLegacy: legacyRole,
        tipoUsuario: userRole,
        primeiroAcesso: responsavel.primeiroAcesso,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Buscar usuário
    const admin = await this.prisma.administrador.findUnique({
      where: { email: dto.email },
    });

    if (admin) {
      const passwordMatch = await bcrypt.compare(dto.senha, admin.senha);

      if (!passwordMatch) {
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      const tokens = await this.generateTokens(admin.id, admin.email, USER_ROLES.ADMINISTRADOR);
      const legacyRole = this.toLegacyRole(USER_ROLES.ADMINISTRADOR);

      return {
        user: {
          id: admin.id,
          email: admin.email,
          nome: admin.nome,
          role: USER_ROLES.ADMINISTRADOR,
          roleLegacy: legacyRole,
          tipoUsuario: USER_ROLES.ADMINISTRADOR,
          primeiroAcesso: admin.primeiroAcesso,
        },
        ...tokens,
      };
    }

    const responsavel = await this.prisma.responsavel.findUnique({
      where: { email: dto.email },
    });

    if (responsavel) {
      const passwordMatch = await bcrypt.compare(dto.senha, responsavel.senha);

      if (!passwordMatch) {
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      const tokens = await this.generateTokens(responsavel.id, responsavel.email, USER_ROLES.RESPONSAVEL);
      const legacyRole = this.toLegacyRole(USER_ROLES.RESPONSAVEL);

      return {
        user: {
          id: responsavel.id,
          email: responsavel.email,
          nome: responsavel.nome,
          role: USER_ROLES.RESPONSAVEL,
          roleLegacy: legacyRole,
          tipoUsuario: USER_ROLES.RESPONSAVEL,
          primeiroAcesso: responsavel.primeiroAcesso,
        },
        ...tokens,
      };
    }

    const catequista = await this.prisma.catequista.findUnique({
      where: { email: dto.email },
    });

    if (!catequista) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const passwordMatch = await bcrypt.compare(dto.senha, catequista.senha);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const tokens = await this.generateTokens(catequista.id, catequista.email, USER_ROLES.CATEQUISTA);
    const legacyRole = this.toLegacyRole(USER_ROLES.CATEQUISTA);

    return {
      user: {
        id: catequista.id,
        email: catequista.email,
        nome: catequista.nome,
        role: USER_ROLES.CATEQUISTA,
        roleLegacy: legacyRole,
        tipoUsuario: USER_ROLES.CATEQUISTA,
        primeiroAcesso: catequista.primeiroAcesso,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const normalizedRole = this.normalizeRole(payload.tipoUsuario ?? payload.role);
      const tokens = await this.generateTokens(payload.sub, payload.email, normalizedRole);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const admin = await this.prisma.administrador.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        telefone: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    if (admin) {
      return { ...admin, role: USER_ROLES.ADMINISTRADOR, roleLegacy: this.toLegacyRole(USER_ROLES.ADMINISTRADOR), tipoUsuario: USER_ROLES.ADMINISTRADOR };
    }

    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        telefone: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    if (responsavel) {
      return { ...responsavel, role: USER_ROLES.RESPONSAVEL, roleLegacy: this.toLegacyRole(USER_ROLES.RESPONSAVEL), tipoUsuario: USER_ROLES.RESPONSAVEL };
    }

    const catequista = await this.prisma.catequista.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        telefone: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    if (catequista) {
      return { ...catequista, role: USER_ROLES.CATEQUISTA, roleLegacy: this.toLegacyRole(USER_ROLES.CATEQUISTA), tipoUsuario: USER_ROLES.CATEQUISTA };
    }

    throw new UnauthorizedException('User not found');
  }

  async forgotPassword(email: string) {
    const admin = await this.prisma.administrador.findUnique({
      where: { email },
    });

    const responsavel = admin
      ? null
      : await this.prisma.responsavel.findUnique({
          where: { email },
        });

    const catequista = admin || responsavel
      ? null
      : await this.prisma.catequista.findUnique({
          where: { email },
        });

    if (!admin && !responsavel && !catequista) {
      // Não revelar que o usuário não existe por segurança
      return { message: 'If the email exists, a reset link was sent' };
    }

    // TODO: Gerar token de reset e enviar email
    // Por enquanto, apenas retorna mensagem de sucesso
    const resetToken = this.jwtService.sign(
      {
        sub: admin ? admin.id : responsavel ? responsavel.id : catequista!.id,
        email: admin ? admin.email : responsavel ? responsavel.email : catequista!.email,
        role: admin ? USER_ROLES.ADMINISTRADOR : responsavel ? USER_ROLES.RESPONSAVEL : USER_ROLES.CATEQUISTA,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    console.log('Reset token:', resetToken);

    return { message: 'If the email exists, a reset link was sent' };
  }

  async resetPassword(token: string, novaSenha: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const hashedPassword = await bcrypt.hash(novaSenha, 10);

      const normalizedRole = this.normalizeRole(payload.tipoUsuario ?? payload.role);

      if (normalizedRole === USER_ROLES.ADMINISTRADOR) {
        await this.prisma.administrador.update({
          where: { id: payload.sub },
          data: { senha: hashedPassword },
        });
      } else if (normalizedRole === USER_ROLES.CATEQUISTA) {
        await this.prisma.catequista.update({
          where: { id: payload.sub },
          data: { senha: hashedPassword },
        });
      } else {
        await this.prisma.responsavel.update({
          where: { id: payload.sub },
          data: { senha: hashedPassword },
        });
      }

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role, roleLegacy: this.toLegacyRole(role), tipoUsuario: role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private toLegacyRole(role: UserRole): 'ADMIN' | 'PARENT' | 'CATECHIST' {
    if (role === USER_ROLES.ADMINISTRADOR) {
      return 'ADMIN';
    }
    if (role === USER_ROLES.CATEQUISTA) {
      return 'CATECHIST';
    }
    return 'PARENT';
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

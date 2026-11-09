import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PasswordSetupProfile } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, UpdateMyProfileDto } from './dto/auth.dto';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { MailerService } from '../../common/mailer/mailer.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private s3StorageService: S3StorageService,
  ) {}

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

      if (responsavel.primeiroAcesso) {
        throw new UnauthorizedException('Use o link enviado por e-mail para criar sua senha antes de entrar.');
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

    if (catequista.primeiroAcesso) {
      throw new UnauthorizedException('Use o link enviado por e-mail para criar sua senha antes de entrar.');
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
        fotoPerfilKey: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    if (admin) {
      return {
        ...admin,
        fotoUrl: await this.resolveProfilePhotoUrl(admin.fotoPerfilKey),
        role: USER_ROLES.ADMINISTRADOR,
        roleLegacy: this.toLegacyRole(USER_ROLES.ADMINISTRADOR),
        tipoUsuario: USER_ROLES.ADMINISTRADOR,
      };
    }

    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        telefone: true,
        fotoPerfilKey: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    if (responsavel) {
      return {
        ...responsavel,
        fotoUrl: await this.resolveProfilePhotoUrl(responsavel.fotoPerfilKey),
        role: USER_ROLES.RESPONSAVEL,
        roleLegacy: this.toLegacyRole(USER_ROLES.RESPONSAVEL),
        tipoUsuario: USER_ROLES.RESPONSAVEL,
      };
    }

    const catequista = await this.prisma.catequista.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        telefone: true,
        fotoPerfilKey: true,
        primeiroAcesso: true,
        criadoEm: true,
      },
    });

    if (catequista) {
      return {
        ...catequista,
        fotoUrl: await this.resolveProfilePhotoUrl(catequista.fotoPerfilKey),
        role: USER_ROLES.CATEQUISTA,
        roleLegacy: this.toLegacyRole(USER_ROLES.CATEQUISTA),
        tipoUsuario: USER_ROLES.CATEQUISTA,
      };
    }

    throw new UnauthorizedException('User not found');
  }

  async updateMyProfile(
    userId: string,
    role: string,
    dto: UpdateMyProfileDto,
    foto?: { buffer: Buffer; mimetype?: string },
  ) {
    if (dto.removerFoto && foto) {
      throw new BadRequestException('Escolha remover a foto ou enviar uma nova, não as duas opções.');
    }

    const passwordFieldsProvided = Boolean(dto.senhaAtual || dto.novaSenha || dto.confirmacaoNovaSenha);
    if (passwordFieldsProvided) {
      if (!dto.senhaAtual || !dto.novaSenha || !dto.confirmacaoNovaSenha) {
        throw new BadRequestException('Preencha a senha atual, a nova senha e a confirmação.');
      }
      if (dto.novaSenha !== dto.confirmacaoNovaSenha) {
        throw new BadRequestException('A nova senha e a confirmação não coincidem.');
      }
      this.assertStrongPassword(dto.novaSenha);
    }

    const normalizedRole = this.normalizeRole(role);
    const profile = await this.findEditableProfile(userId, normalizedRole);
    if (!profile) throw new UnauthorizedException('User not found');

    let newPasswordHash: string | undefined;
    if (dto.novaSenha) {
      if (!(await bcrypt.compare(dto.senhaAtual!, profile.senha))) {
        throw new BadRequestException('A senha atual está incorreta.');
      }
      newPasswordHash = await bcrypt.hash(dto.novaSenha, 12);
    }

    let newPhotoKey = profile.fotoPerfilKey;
    if (foto) {
      const mimeType = (foto.mimetype ?? '').toLowerCase();
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mimeType)) {
        throw new BadRequestException('A foto deve estar no formato JPG, PNG ou WEBP.');
      }
      newPhotoKey = (await this.s3StorageService.uploadBufferDocument(
        foto.buffer,
        mimeType,
        'perfis',
        userId,
      )).key;
    } else if (dto.removerFoto) {
      newPhotoKey = null;
    }

    const data: { nome?: string; telefone?: string | null; fotoPerfilKey?: string | null; senha?: string } = {};
    if (dto.nome !== undefined) data.nome = dto.nome.trim();
    if (dto.telefone !== undefined) data.telefone = dto.telefone.trim() || null;
    if (newPhotoKey !== profile.fotoPerfilKey) data.fotoPerfilKey = newPhotoKey;
    if (newPasswordHash) data.senha = newPasswordHash;

    if (normalizedRole === USER_ROLES.ADMINISTRADOR) {
      await this.prisma.administrador.update({ where: { id: userId }, data });
    } else if (normalizedRole === USER_ROLES.CATEQUISTA) {
      await this.prisma.catequista.update({ where: { id: userId }, data });
    } else {
      await this.prisma.responsavel.update({ where: { id: userId }, data });
    }

    if (profile.fotoPerfilKey && profile.fotoPerfilKey !== newPhotoKey) {
      await this.s3StorageService.deleteObject(profile.fotoPerfilKey).catch(() => undefined);
    }

    return this.getMe(userId);
  }

  async sendPasswordSetupInvite(
    profileType: PasswordSetupProfile,
    profileId: string,
    email: string,
    nome: string,
  ) {
    return this.sendPasswordSetupEmail(profileType, profileId, email, nome, true, false);
  }

  async validatePasswordSetupToken(token: string) {
    const setupToken = await this.findActivePasswordSetupToken(token);
    const profile = await this.findPasswordSetupProfile(setupToken.profileType, setupToken.profileId);

    if (!profile || profile.email.toLowerCase() !== setupToken.email.toLowerCase()) {
      throw new BadRequestException('Este convite é inválido ou expirou. Solicite um novo e-mail à coordenação.');
    }

    return {
      email: profile.email,
      nome: profile.nome,
      expiresAt: setupToken.expiresAt,
    };
  }

  async completePasswordSetup(token: string, senha: string, confirmacao: string) {
    if (senha !== confirmacao) {
      throw new BadRequestException('As senhas não coincidem.');
    }
    this.assertStrongPassword(senha);

    const setupToken = await this.findActivePasswordSetupToken(token);
    const profile = await this.findPasswordSetupProfile(setupToken.profileType, setupToken.profileId);

    if (!profile || profile.email.toLowerCase() !== setupToken.email.toLowerCase()) {
      throw new BadRequestException('Este convite é inválido ou expirou. Solicite um novo e-mail à coordenação.');
    }

    const hashedPassword = await bcrypt.hash(senha, 12);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const consumedToken = await tx.passwordSetupToken.updateMany({
        where: {
          id: setupToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (consumedToken.count !== 1) {
        throw new BadRequestException('Este convite já foi usado ou expirou. Solicite um novo e-mail à coordenação.');
      }

      if (setupToken.profileType === PasswordSetupProfile.RESPONSAVEL) {
        await tx.responsavel.update({
          where: { id: setupToken.profileId },
          data: { senha: hashedPassword, primeiroAcesso: false },
        });
      } else if (setupToken.profileType === PasswordSetupProfile.CATEQUISTA) {
        await tx.catequista.update({
          where: { id: setupToken.profileId },
          data: { senha: hashedPassword, primeiroAcesso: false },
        });
      } else {
        await tx.administrador.update({
          where: { id: setupToken.profileId },
          data: { senha: hashedPassword, primeiroAcesso: false },
        });
      }
    });

    return { message: 'Senha criada com sucesso.' };
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

    const profile = admin ?? responsavel ?? catequista;
    if (profile) {
      const profileType = admin
        ? PasswordSetupProfile.ADMINISTRADOR
        : responsavel
          ? PasswordSetupProfile.RESPONSAVEL
          : PasswordSetupProfile.CATEQUISTA;

      try {
        await this.sendPasswordSetupEmail(profileType, profile.id, profile.email, profile.nome, false, true);
      } catch (error) {
        this.logger.warn(`Password reset email could not be sent for ${profileType} profile ${profile.id}.`);
      }
    }

    return { message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.' };
  }

  async resetPassword(token: string, novaSenha: string) {
    return this.completePasswordSetup(token, novaSenha, novaSenha);
  }

  private async findEditableProfile(userId: string, role: UserRole) {
    const select = { id: true, email: true, nome: true, telefone: true, senha: true, fotoPerfilKey: true } as const;

    if (role === USER_ROLES.ADMINISTRADOR) {
      return this.prisma.administrador.findUnique({ where: { id: userId }, select });
    }
    if (role === USER_ROLES.CATEQUISTA) {
      return this.prisma.catequista.findUnique({ where: { id: userId }, select });
    }
    return this.prisma.responsavel.findUnique({ where: { id: userId }, select });
  }

  private async resolveProfilePhotoUrl(photoKey: string | null) {
    return photoKey ? this.s3StorageService.getFileUrl(photoKey) : null;
  }

  private async sendPasswordSetupEmail(
    profileType: PasswordSetupProfile,
    profileId: string,
    email: string,
    nome: string,
    requireDelivery: boolean,
    isPasswordReset: boolean,
  ) {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const setupToken = await this.prisma.passwordSetupToken.create({
      data: { profileType, profileId, email, tokenHash, expiresAt },
    });

    try {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ??
        this.configService.get<string>('FRONTEND_URLS')?.split(',')[0]?.trim() ??
        'http://localhost:8080';
      const setupUrl = new URL('/criar-senha', frontendUrl);
      setupUrl.searchParams.set('token', rawToken);
      const subject = isPasswordReset
        ? 'Redefina sua senha | Catequese Bom Pastor'
        : 'Crie sua senha de acesso | Catequese Bom Pastor';
      const action = isPasswordReset ? 'redefinir sua senha' : 'criar sua senha de acesso';
      const text = [
        `Olá, ${nome}.`,
        '',
        isPasswordReset
          ? 'Recebemos uma solicitação para redefinir a senha da sua conta.'
          : 'Seu acesso à Catequese Bom Pastor foi aprovado.',
        `Use o link abaixo para ${action}:`,
        setupUrl.toString(),
        '',
        'O link expira em 24 horas e só pode ser usado uma vez.',
        'Se você não solicitou esta ação, ignore esta mensagem.',
      ].join('\n');

      const delivery = await this.mailerService.sendMail({
        to: [email],
        subject,
        text,
        html: `<p>Olá, ${this.escapeHtml(nome)}.</p><p>${this.escapeHtml(text.split('\n').slice(3, 4)[0])}</p><p><a href="${setupUrl.toString()}">Criar senha</a></p><p>O link expira em 24 horas e só pode ser usado uma vez.</p><p>Se você não solicitou esta ação, ignore esta mensagem.</p>`,
      }, { requireDelivery });

      if (delivery?.skipped) {
        await this.prisma.passwordSetupToken.delete({ where: { id: setupToken.id } });
        return { emailSent: false, email };
      }

      await this.prisma.passwordSetupToken.updateMany({
        where: {
          profileType,
          profileId,
          usedAt: null,
          id: { not: setupToken.id },
        },
        data: { usedAt: new Date() },
      });

      return { emailSent: true, email, expiresAt };
    } catch (error) {
      await this.prisma.passwordSetupToken.delete({ where: { id: setupToken.id } }).catch(() => undefined);
      throw error;
    }
  }

  private async findActivePasswordSetupToken(token: string) {
    if (!token) {
      throw new BadRequestException('O link está incompleto. Solicite um novo e-mail à coordenação.');
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const setupToken = await this.prisma.passwordSetupToken.findUnique({ where: { tokenHash } });

    if (!setupToken || setupToken.usedAt || setupToken.expiresAt <= new Date()) {
      throw new BadRequestException('Este convite é inválido ou expirou. Solicite um novo e-mail à coordenação.');
    }

    return setupToken;
  }

  private async findPasswordSetupProfile(profileType: PasswordSetupProfile, profileId: string) {
    if (profileType === PasswordSetupProfile.RESPONSAVEL) {
      return this.prisma.responsavel.findUnique({ where: { id: profileId }, select: { id: true, email: true, nome: true } });
    }
    if (profileType === PasswordSetupProfile.CATEQUISTA) {
      return this.prisma.catequista.findUnique({ where: { id: profileId }, select: { id: true, email: true, nome: true } });
    }
    return this.prisma.administrador.findUnique({ where: { id: profileId }, select: { id: true, email: true, nome: true } });
  }

  private assertStrongPassword(password: string) {
    const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(password);
    if (!isStrong) {
      throw new BadRequestException('A senha deve ter ao menos 12 caracteres, com maiúscula, minúscula, número e símbolo.');
    }
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character] ?? character);
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

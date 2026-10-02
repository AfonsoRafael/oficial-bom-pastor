import { Controller, Post, Body, Get, UseGuards, Query, Patch, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, CompletePasswordSetupDto, UpdateMyProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

type ProfilePhotoFile = { buffer: Buffer; mimetype?: string };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Solicitar reset de senha' })
  @ApiResponse({ status: 200, description: 'Email de reset enviado' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Resetar senha' })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.novaSenha);
  }

  @Get('password-setup')
  @Public()
  @ApiOperation({ summary: 'Validar convite de definição de senha' })
  async validatePasswordSetup(@Query('token') token: string) {
    return this.authService.validatePasswordSetupToken(token);
  }

  @Post('password-setup')
  @Public()
  @ApiOperation({ summary: 'Definir senha usando convite enviado por e-mail' })
  async completePasswordSetup(@Body() dto: CompletePasswordSetupDto) {
    return this.authService.completePasswordSetup(dto.token, dto.senha, dto.confirmacao);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualizar o próprio perfil autenticado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string' },
        telefone: { type: 'string' },
        fotoPerfil: { type: 'string', format: 'binary' },
        removerFoto: { type: 'boolean' },
        senhaAtual: { type: 'string' },
        novaSenha: { type: 'string' },
        confirmacaoNovaSenha: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('fotoPerfil', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async updateMe(
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateMyProfileDto,
    @UploadedFile() foto?: ProfilePhotoFile,
  ) {
    if (foto && !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes((foto.mimetype ?? '').toLowerCase())) {
      throw new BadRequestException('A foto deve estar no formato JPG, PNG ou WEBP.');
    }

    return this.authService.updateMyProfile(userId, role, dto, foto);
  }
}

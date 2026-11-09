import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../common/constants/user-roles';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacoesService } from './notificacoes.service';
import { ListNotificacoesQueryDto, MarkNotificacaoReadDto } from './dto/notificacao.dto';

@ApiTags('notificacoes')
@Controller('notificacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'apenasNaoLidas', required: false })
  listNotificacoes(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Query() query: ListNotificacoesQueryDto,
  ) {
    return this.notificacoesService.listNotificacoes(userId, role, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter quantidade de notificações não lidas' })
  getUnreadCount(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.notificacoesService.getUnreadCount(userId, role);
  }

  @Post('mark-as-read')
  @ApiOperation({ summary: 'Marcar notificações específicas como lidas' })
  markAsRead(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Body() dto: MarkNotificacaoReadDto,
  ) {
    return this.notificacoesService.markAsRead(userId, role, dto.ids);
  }

  @Post('mark-all-as-read')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  markAllAsRead(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.notificacoesService.markAllAsRead(userId, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma notificação' })
  deleteNotificacao(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Param('id') id: string,
  ) {
    return this.notificacoesService.deleteNotificacao(userId, role, id);
  }
}
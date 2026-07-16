import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComunicacaoService } from './comunicacao.service';
import { SendMensagemDto, ListMensagensQueryDto, MarkAsReadDto } from './dto/comunicacao.dto';

@ApiTags('comunicacao')
@Controller('comunicacao')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @Get('recipients')
  @ApiOperation({ summary: 'Listar destinatários disponíveis para o usuário autenticado' })
  @ApiQuery({ name: 'turmaId', required: false })
  getRecipients(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Query('turmaId') turmaId?: string,
  ) {
    return this.comunicacaoService.getRecipients(userId, role, turmaId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Enviar mensagem' })
  sendMessage(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Body() dto: SendMensagemDto,
  ) {
    return this.comunicacaoService.sendMessage(userId, role, dto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Listar mensagens do usuário autenticado' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listMessages(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Query() query: ListMensagensQueryDto,
  ) {
    return this.comunicacaoService.listMessages(userId, role, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter quantidade de mensagens não lidas' })
  getUnreadCount(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.comunicacaoService.getUnreadCount(userId, role);
  }

  @Post('mark-as-read')
  @ApiOperation({ summary: 'Marcar mensagens como lidas' })
  markAsRead(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Body() dto: MarkAsReadDto,
  ) {
    return this.comunicacaoService.markAsRead(userId, role, dto.ids);
  }
}
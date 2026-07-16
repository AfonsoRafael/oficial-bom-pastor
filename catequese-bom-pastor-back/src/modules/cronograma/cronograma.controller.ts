import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CronogramaService } from './cronograma.service';
import { CreateEventoDto, UpdateEventoDto } from './dto/evento.dto';

@ApiTags('cronograma')
@Controller('cronograma')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CronogramaController {
  constructor(private readonly cronogramaService: CronogramaService) {}

  @Get('eventos/publicos')
  @Public()
  @ApiOperation({ summary: 'Listar próximos eventos públicos da comunidade' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findPublicUpcoming(@Query('limit') limit?: string) {
    return this.cronogramaService.findPublicUpcoming(limit ? parseInt(limit, 10) : 5);
  }

  @Get('eventos')
  @ApiOperation({ summary: 'Listar eventos do cronograma' })
  @ApiQuery({ name: 'turmaId', required: false })
  @ApiQuery({ name: 'categoria', required: false })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
    @Query('turmaId') turmaId?: string,
    @Query('categoria') categoria?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.cronogramaService.findAll(
      userId,
      role,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
      turmaId,
      categoria,
      dataInicio,
      dataFim,
    );
  }

  @Get('eventos/:id')
  @ApiOperation({ summary: 'Buscar evento por ID' })
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.cronogramaService.findOne(id, userId, role);
  }

  @Post('eventos')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Criar evento no cronograma (ADMIN only)' })
  create(
    @Body() dto: CreateEventoDto,
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.cronogramaService.create(dto, userId, role);
  }

  @Put('eventos/:id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualizar evento no cronograma (ADMIN only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventoDto,
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.cronogramaService.update(id, dto, userId, role);
  }

  @Delete('eventos/:id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Deletar evento no cronograma (ADMIN only)' })
  delete(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.cronogramaService.delete(id, userId, role);
  }
}
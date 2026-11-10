import { Controller, Get, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResponsaveisService } from './responsaveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@ApiTags('responsaveis')
@Controller('responsaveis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResponsaveisController {
  constructor(private readonly responsaveisService: ResponsaveisService) {}

  @Get()
    @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar responsáveis (ADMIN only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.responsaveisService.findAll(
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar responsável por ID' })
    findOne(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.responsaveisService.findOne(id, userId, role);
  }

  @Delete(':id')
    @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Deletar responsável (ADMIN only)' })
    remove(@Param('id') id: string, @GetUser('role') role: UserRole) {
    return this.responsaveisService.remove(id, role);
  }
}

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { MatriculaModule } from '../matricula/matricula.module';
import { DocumentoModule } from './documento.module';

describe('DocumentoModule', () => {
  let app: INestApplication;
  const jwt = new JwtService();
  const prisma = {
    matricula: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
    documento: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const documento = {
    id: 9007199254740993n, matriculaId: 7n, nomeArquivo: 'certidao.pdf',
    tipoDocumento: 'CERTIDAO_NASCIMENTO', status: 'PENDENTE', parecer: null,
    dataEnvio: new Date('2026-01-01T00:00:00.000Z'),
  };
  const token = (perfis: UserRole[], id = '42') => jwt.sign(
    { sub: id, email: 'user@example.com', perfis, tokenUse: 'access' },
    { secret: 'test-secret' },
  );
  const auth = (perfis: UserRole[], id?: string) => `Bearer ${token(perfis, id)}`;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DocumentoModule, MatriculaModule],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, forbidNonWhitelisted: true, transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((fn) => fn(prisma));
    prisma.matricula.findUnique.mockResolvedValue({ id: 7n });
    prisma.matricula.findFirst.mockResolvedValue({ id: 7n });
    prisma.documento.create.mockResolvedValue(documento);
    prisma.documento.findMany.mockResolvedValue([documento]);
    prisma.documento.findFirst.mockResolvedValue(documento);
    prisma.matricula.findMany.mockResolvedValue([]);
  });

  afterAll(async () => { await app.close(); });

  it('exige autenticação e permite registro somente à equipe', async () => {
    const body = { nomeArquivo: ' certidao.pdf ', tipoDocumento: 'CERTIDAO_NASCIMENTO' };
    await request(app.getHttpServer()).post('/api/matriculas/7/documentos').send(body).expect(401);
    await request(app.getHttpServer()).post('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.RESPONSAVEL])).send(body).expect(403);
    const response = await request(app.getHttpServer()).post('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.SECRETARIA])).send(body).expect(201);
    expect(response.body).toEqual({ ...documento, id: '9007199254740993', matriculaId: '7', dataEnvio: '2026-01-01T00:00:00.000Z' });
    expect(prisma.documento.create).toHaveBeenCalledWith(expect.objectContaining({
      data: { matriculaId: 7n, nomeArquivo: 'certidao.pdf', tipoDocumento: 'CERTIDAO_NASCIMENTO', status: 'PENDENTE', parecer: null },
    }));
  });

  it.each([USER_ROLES.ADMINISTRADOR, USER_ROLES.COORDENADOR, USER_ROLES.SECRETARIA])(
    'permite a %s consultar documentos sem vínculo de responsável',
    async (role) => {
      await request(app.getHttpServer()).get('/api/matriculas/7/documentos')
        .set('Authorization', auth([role])).expect(200);
      expect(prisma.matricula.findFirst).toHaveBeenCalledWith({ where: { id: 7n }, select: { id: true } });
    },
  );

  it('limita consulta do responsável a matrícula aprovada e vinculada ao usuário', async () => {
    const response = await request(app.getHttpServer()).get('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.RESPONSAVEL])).expect(200);
    expect(response.body[0].id).toBe('9007199254740993');
    expect(prisma.matricula.findFirst).toHaveBeenCalledWith({
      where: { id: 7n, status: 'APROVADA', responsavel: { usuarioId: 42n } },
      select: { id: true },
    });
    prisma.matricula.findFirst.mockResolvedValueOnce(null);
    await request(app.getHttpServer()).get('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.RESPONSAVEL], '43')).expect(404);
    expect(prisma.documento.findMany).toHaveBeenCalledTimes(1);
  });

  it('nega leitura anônima ou de outros perfis', async () => {
    await request(app.getHttpServer()).get('/api/matriculas/7/documentos').expect(401);
    await request(app.getHttpServer()).get('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.CATEQUISTA])).expect(403);
    expect(prisma.documento.findMany).not.toHaveBeenCalled();
  });

  it('consulta documento pela matrícula e rejeita outro documento', async () => {
    await request(app.getHttpServer()).get('/api/matriculas/7/documentos/9007199254740993')
      .set('Authorization', auth([USER_ROLES.RESPONSAVEL])).expect(200);
    expect(prisma.documento.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 9007199254740993n, matriculaId: 7n },
    }));
    prisma.documento.findFirst.mockResolvedValueOnce(null);
    await request(app.getHttpServer()).get('/api/matriculas/7/documentos/8')
      .set('Authorization', auth([USER_ROLES.RESPONSAVEL])).expect(404);
  });

  it('rejeita matrícula inexistente e IDs inválidos', async () => {
    prisma.matricula.findUnique.mockResolvedValueOnce(null);
    await request(app.getHttpServer()).post('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.COORDENADOR]))
      .send({ nomeArquivo: 'a.pdf', tipoDocumento: 'CERTIFICADO_BATISMO' }).expect(404);
    await request(app.getHttpServer()).get('/api/matriculas/9223372036854775808/documentos')
      .set('Authorization', auth([USER_ROLES.SECRETARIA])).expect(400);
    await request(app.getHttpServer()).get('/api/matriculas/7/documentos/0')
      .set('Authorization', auth([USER_ROLES.SECRETARIA])).expect(400);
    expect(prisma.documento.create).not.toHaveBeenCalled();
  });

  it.each([
    { nomeArquivo: '', tipoDocumento: 'CERTIDAO_NASCIMENTO' },
    { nomeArquivo: 12, tipoDocumento: 'CERTIDAO_NASCIMENTO' },
    { nomeArquivo: 'a.pdf', tipoDocumento: 'INVALIDO' },
    { nomeArquivo: 'a.pdf', tipoDocumento: 'CERTIFICADO_BATISMO', status: 'APROVADO' },
    { nomeArquivo: 'a.pdf', tipoDocumento: 'CERTIFICADO_BATISMO', parecer: 'aprovado' },
  ])('rejeita metadados inválidos ou parecer/status enviados pelo cliente: %p', async (body) => {
    await request(app.getHttpServer()).post('/api/matriculas/7/documentos')
      .set('Authorization', auth([USER_ROLES.SECRETARIA])).send(body).expect(400);
    expect(prisma.documento.create).not.toHaveBeenCalled();
  });

  it('lista apenas matrículas aprovadas vinculadas ao responsável', async () => {
    prisma.matricula.findMany.mockResolvedValue([{
      id: 7n, status: 'APROVADA', catequizandoNome: 'Ana', dataSolicitacao: null,
      etapa: { id: 2n, nome: 'Nível I' },
    }]);
    const response = await request(app.getHttpServer()).get('/api/matriculas/minhas')
      .set('Authorization', auth([USER_ROLES.RESPONSAVEL])).expect(200);
    expect(response.body[0]).toMatchObject({ id: '7', etapa: { id: '2' } });
    expect(prisma.matricula.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'APROVADA', responsavel: { usuarioId: 42n } },
    }));
    await request(app.getHttpServer()).get('/api/matriculas/minhas')
      .set('Authorization', auth([USER_ROLES.CATEQUISTA])).expect(403);
  });
});

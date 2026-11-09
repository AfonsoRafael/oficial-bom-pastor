import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { S3StorageService } from '../src/common/storage/s3-storage.service';
import { MailerService } from '../src/common/mailer/mailer.service';

const databaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('Pré-matrícula e renovação (banco de teste)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let parentToken: string;
  let otherToken: string;
  let adminId: string;
  let parentId: string;
  let otherId: string;
  let preId: string;
  let childId: string;
  let renewalId: string;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const parentEmail = `family-${suffix}@example.invalid`;
  const uploads: string[] = [];

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.JWT_SECRET = 'test-secret-for-isolated-e2e';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-isolated-e2e';
    delete process.env.DISABLE_AUTH;
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(S3StorageService).useValue({
        uploadBufferDocument: async (_buffer: Buffer, _mime: string, folder: string, label: string) => {
          const key = `${folder}/${suffix}-${label}`;
          uploads.push(key);
          return { key, url: `https://storage.invalid/${key}` };
        },
        getStoredFileUrl: async (key: string) => `https://storage.invalid/${key}`,
        deleteObject: async () => undefined,
      })
      .overrideProvider(MailerService).useValue({ sendMail: async () => ({ skipped: true }) })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
    prisma = app.get(PrismaService);
    const admin = await prisma.administrador.create({ data: { email: `admin-${suffix}@example.invalid`, nome: 'Admin teste', senha: 'unused' } });
    const other = await prisma.responsavel.create({ data: { email: `other-${suffix}@example.invalid`, nome: 'Outro', senha: 'unused' } });
    adminId = admin.id;
    otherId = other.id;
    const jwt = new JwtService({ secret: process.env.JWT_SECRET });
    adminToken = jwt.sign({ sub: admin.id, tipoUsuario: 'ADMINISTRADOR' });
    otherToken = jwt.sign({ sub: other.id, tipoUsuario: 'RESPONSAVEL' });
  });

  afterAll(async () => {
    if (prisma) {
      if (preId) await prisma.preMatricula.deleteMany({ where: { id: preId } });
      if (parentId) await prisma.responsavel.deleteMany({ where: { id: parentId } });
      if (otherId) await prisma.responsavel.deleteMany({ where: { id: otherId } });
      if (adminId) await prisma.administrador.deleteMany({ where: { id: adminId } });
    }
    if (app) await app.close();
  });

  it('recebe todos os dados e documentos e apresenta-os à coordenação', async () => {
    await request(app.getHttpServer()).post('/api/pre-matriculas')
      .field('nomeCatequizando', 'Criança Teste').field('dataNascimento', '2015-05-12')
      .field('nomePai', 'Pai Teste').field('email', parentEmail).field('telefone', '(11) 99999-9999')
      .field('aceiteTermos', 'true').expect(400);
    const response = await request(app.getHttpServer()).post('/api/pre-matriculas')
      .field('nomeCatequizando', 'Criança Teste')
      .field('dataNascimento', '2015-05-12')
      .field('nomePai', 'Pai Teste')
      .field('sacramentosPai', 'BATISMO,CRISMA')
      .field('email', parentEmail)
      .field('telefone', '(11) 99999-9999')
      .field('alergiasProblemasSaude', 'Informação de teste')
      .field('aceiteTermos', 'true')
      .attach('certificadoBatismo', Buffer.from('documento teste'), { filename: 'batismo.pdf', contentType: 'application/pdf' })
      .attach('comprovanteEndereco', Buffer.from('documento teste'), { filename: 'endereco.pdf', contentType: 'application/pdf' })
      .attach('certidaoDeNascimento', Buffer.from('documento teste'), { filename: 'nascimento.pdf', contentType: 'application/pdf' })
      .expect(201);
    preId = response.body.id;
    const stored = await prisma.preMatricula.findUnique({ where: { id: preId } });
    expect(stored.aceiteTermosEm).not.toBeNull();
    const list = await request(app.getHttpServer()).get('/api/pre-matriculas?status=PENDING').set('Authorization', `Bearer ${adminToken}`).expect(200);
    const application = list.body.preMatriculas.find((item: { id: string }) => item.id === preId);
    expect(application).toMatchObject({ nomePai: 'Pai Teste', sacramentosPai: 'BATISMO,CRISMA', alergiasProblemasSaude: 'Informação de teste' });
    expect(application.CertificadoBatismo).toContain('storage.invalid');
    await request(app.getHttpServer()).get('/api/pre-matriculas').set('Authorization', `Bearer ${otherToken}`).expect(403);
  });

  it('aprova sem perder documentos e permite solicitar renovação com Pix', async () => {
    await request(app.getHttpServer()).put(`/api/pre-matriculas/${preId}/approve`).set('Authorization', `Bearer ${adminToken}`).send({}).expect(200);
    const parent = await prisma.responsavel.findUnique({ where: { email: parentEmail } });
    parentId = parent.id;
    const child = await prisma.catequizando.findFirst({ where: { responsavelId: parent.id }, include: { documentos: true } });
    childId = child.id;
    expect(child.documentos).toHaveLength(3);
    parentToken = new JwtService({ secret: process.env.JWT_SECRET }).sign({ sub: parent.id, tipoUsuario: 'RESPONSAVEL' });
    const otherChildren = await request(app.getHttpServer()).get('/api/catequizandos').set('Authorization', `Bearer ${otherToken}`).expect(200);
    expect(otherChildren.body.catequizandos.some((item: { id: string }) => item.id === child.id)).toBe(false);
    const mine = await request(app.getHttpServer()).get('/api/renovacoes/me').set('Authorization', `Bearer ${parentToken}`).expect(200);
    expect(mine.body.catequizandos[0].documentosFaltantes).toEqual([]);
    const year = new Date().getFullYear() + 1;
    await request(app.getHttpServer()).post('/api/renovacoes').set('Authorization', `Bearer ${otherToken}`)
      .field('catequizandoId', childId).field('ano', year)
      .attach('comprovantePix', Buffer.from('pix'), { filename: 'pix.pdf', contentType: 'application/pdf' }).expect(404);
    const result = await request(app.getHttpServer()).post('/api/renovacoes').set('Authorization', `Bearer ${parentToken}`)
      .field('catequizandoId', childId).field('ano', year)
      .attach('comprovantePix', Buffer.from('pix'), { filename: 'pix.pdf', contentType: 'application/pdf' }).expect(201);
    renewalId = result.body.id;
    await request(app.getHttpServer()).post('/api/renovacoes').set('Authorization', `Bearer ${parentToken}`)
      .field('catequizandoId', childId).field('ano', year)
      .attach('comprovantePix', Buffer.from('pix'), { filename: 'pix.pdf', contentType: 'application/pdf' }).expect(409);
    await request(app.getHttpServer()).get('/api/renovacoes').set('Authorization', `Bearer ${parentToken}`).expect(403);
    const list = await request(app.getHttpServer()).get('/api/renovacoes').set('Authorization', `Bearer ${adminToken}`).expect(200);
    const entry = list.body.find((item: { id: string }) => item.id === renewalId);
    expect(entry.comprovanteUrl).toContain('comprovantePix');
    expect(entry.documentos.every((doc: { url: string }) => Boolean(doc.url))).toBe(true);
    await request(app.getHttpServer()).patch(`/api/renovacoes/${renewalId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'REJECTED' }).expect(400);
    await request(app.getHttpServer()).patch(`/api/renovacoes/${renewalId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'APPROVED' }).expect(200);
    const updated = await request(app.getHttpServer()).get('/api/renovacoes/me').set('Authorization', `Bearer ${parentToken}`).expect(200);
    expect(updated.body.renovacoes[0].status).toBe('APPROVED');
    expect(uploads).toHaveLength(4);
  });

  it('exige documentos faltantes e permite reenviar após recusa', async () => {
    const child = await prisma.catequizando.create({
      data: { nome: 'Segundo teste', dataNascimento: new Date('2016-01-01'), responsavelId: parentId },
    });
    const year = new Date().getFullYear() + 1;
    await request(app.getHttpServer()).post('/api/renovacoes').set('Authorization', `Bearer ${parentToken}`)
      .field('catequizandoId', child.id).field('ano', year)
      .attach('comprovantePix', Buffer.from('pix'), { filename: 'pix.pdf', contentType: 'application/pdf' }).expect(400);
    const send = () => request(app.getHttpServer()).post('/api/renovacoes').set('Authorization', `Bearer ${parentToken}`)
      .field('catequizandoId', child.id).field('ano', year)
      .attach('comprovantePix', Buffer.from('pix'), { filename: 'pix.pdf', contentType: 'application/pdf' });
    const result = await send()
      .attach('certificadoBatismo', Buffer.from('teste'), { filename: 'batismo.pdf', contentType: 'application/pdf' })
      .attach('comprovanteEndereco', Buffer.from('teste'), { filename: 'endereco.pdf', contentType: 'application/pdf' })
      .attach('certidaoNascimento', Buffer.from('teste'), { filename: 'nascimento.pdf', contentType: 'application/pdf' })
      .expect(201);
    await request(app.getHttpServer()).patch(`/api/renovacoes/${result.body.id}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REJECTED', observacoes: 'Comprovante ilegível' }).expect(200);
    const mine = await request(app.getHttpServer()).get('/api/renovacoes/me').set('Authorization', `Bearer ${parentToken}`).expect(200);
    expect(mine.body.renovacoes.find((item: { id: string }) => item.id === result.body.id).observacoes).toBe('Comprovante ilegível');
    expect(mine.body.catequizandos.find((item: { id: string }) => item.id === child.id).documentosFaltantes).toEqual([]);
    const retry = await send().expect(201);
    expect(retry.body.id).toBe(result.body.id);
    expect(retry.body.status).toBe('PENDING');
  });
});

import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar administrador
  const adminPassword = await bcrypt.hash('123', 10);
  const admin = await prisma.administrador.upsert({
    where: { email: 'admin@catequese.com' },
    update: {
      senha: adminPassword,
      nome: 'Administrador',
      primeiroAcesso: true,
    },
    create: {
      email: 'admin@catequese.com',
      nome: 'Administrador',
      senha: adminPassword,
      primeiroAcesso: true,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar responsável/pai
  const parentPassword = await bcrypt.hash('parent123', 10);
  const responsavel = await prisma.responsavel.upsert({
    where: { email: 'pai@catequese.com' },
    update: {
      nome: 'João Silva',
      telefone: '11988888888',
      senha: parentPassword,
      primeiroAcesso: true,
    },
    create: {
      email: 'pai@catequese.com',
      nome: 'João Silva',
      telefone: '11988888888',
      senha: parentPassword,
      primeiroAcesso: true,
    },
  });
  console.log('✅ Responsável criado:', responsavel.email);

  // Criar catequistas
  const catequistaPassword1 = await bcrypt.hash('ana123', 10);
  const catequista1 = await prisma.catequista.upsert({
    where: { email: 'ana.catequista@catequese.com' },
    update: {
      senha: catequistaPassword1,
      nome: 'Ana Silva',
      primeiroAcesso: true,
    },
    create: {
      nome: 'Ana Silva',
      email: 'ana.catequista@catequese.com',
      senha: catequistaPassword1,
      telefone: '11977777777',
      endereco: 'Rua das Acácias, 100 - São Paulo, SP',
      bio: 'Catequista experiente com 10 anos de dedicação ao ensino da fé',
      primeiroAcesso: true,
    },
  });
  console.log('✅ Catequista criada:', catequista1.email);

  const catequistaPassword2 = await bcrypt.hash('carlos123', 10);
  const catequista2 = await prisma.catequista.upsert({
    where: { email: 'carlos.catequista@catequese.com' },
    update: {
      senha: catequistaPassword2,
      nome: 'Carlos Mendes',
      primeiroAcesso: true,
    },
    create: {
      nome: 'Carlos Mendes',
      email: 'carlos.catequista@catequese.com',
      senha: catequistaPassword2,
      telefone: '11966666666',
      endereco: 'Avenida Brasil, 200 - São Paulo, SP',
      bio: 'Especialista em catequese infantil',
      primeiroAcesso: true,
    },
  });
  console.log('✅ Catequista criada:', catequista2.email);

  // Criar turmas
  const turma2024 = await prisma.turma.upsert({
    where: { id: 'seed-turma-2024' },
    update: {},
    create: {
      id: 'seed-turma-2024',
      nome: 'Primeira Comunhão 2024',
      ano: 2024,
      horario: 'Sábado 14:00',
      sala: 'Sala 1',
      administradorId: admin.id,
      catequistaId: catequista1.id,
    },
  });
  console.log('✅ Turma criada:', turma2024.nome);

  const turma2025 = await prisma.turma.upsert({
    where: { id: 'seed-turma-2025' },
    update: {},
    create: {
      id: 'seed-turma-2025',
      nome: 'Crisma 2025',
      ano: 2025,
      horario: 'Domingo 16:00',
      sala: 'Sala 2',
      administradorId: admin.id,
      catequistaId: catequista2.id,
    },
  });
  console.log('✅ Turma criada:', turma2025.nome);

  // Criar catequizandos
  const catequizando1 = await prisma.catequizando.upsert({
    where: { id: 'seed-catequizando-1' },
    update: {},
    create: {
      id: 'seed-catequizando-1',
      nome: 'Pedro Silva',
      dataNascimento: new Date('2014-05-10'),
      dataBatismo: new Date('2014-12-20'),
      cpf: '123.456.789-00',
      email: 'pedro.silva@email.com',
      telefone: '11955555555',
      endereco: 'Rua das Flores, 123 - São Paulo, SP',
      turmaId: turma2024.id,
      responsavelId: responsavel.id,
      observacoes: 'Primeira comunhão',
    },
  });
  console.log('✅ Catequizando criado:', catequizando1.nome);

  const catequizando2 = await prisma.catequizando.upsert({
    where: { id: 'seed-catequizando-2' },
    update: {},
    create: {
      id: 'seed-catequizando-2',
      nome: 'Ana Silva',
      dataNascimento: new Date('2010-08-20'),
      dataBatismo: new Date('2011-01-10'),
      cpf: '234.567.890-11',
      email: 'ana.silva@email.com',
      telefone: '11944444444',
      endereco: 'Avenida Paulista, 456 - São Paulo, SP',
      turmaId: turma2025.id,
      responsavelId: responsavel.id,
      observacoes: 'Crisma',
    },
  });
  console.log('✅ Catequizando criado:', catequizando2.nome);

  // Criar documentos dos catequizandos
  await prisma.catequizandoDocumento.upsert({
    where: {
      catequizandoId_tipo: {
        catequizandoId: catequizando1.id,
        tipo: 'CERTIDAO_NASCIMENTO',
      },
    },
    update: {},
    create: {
      catequizandoId: catequizando1.id,
      tipo: 'CERTIDAO_NASCIMENTO',
      status: true,
      uploadDate: new Date('2024-10-15'),
    },
  });

  await prisma.catequizandoDocumento.upsert({
    where: {
      catequizandoId_tipo: {
        catequizandoId: catequizando1.id,
        tipo: 'CPF',
      },
    },
    update: {},
    create: {
      catequizandoId: catequizando1.id,
      tipo: 'CPF',
      status: true,
      uploadDate: new Date('2024-10-15'),
    },
  });

  await prisma.catequizandoDocumento.upsert({
    where: {
      catequizandoId_tipo: {
        catequizandoId: catequizando1.id,
        tipo: 'CARTEIRA_VACINA',
      },
    },
    update: {},
    create: {
      catequizandoId: catequizando1.id,
      tipo: 'CARTEIRA_VACINA',
      status: true,
      uploadDate: new Date('2024-10-20'),
    },
  });

  await prisma.catequizandoDocumento.upsert({
    where: {
      catequizandoId_tipo: {
        catequizandoId: catequizando2.id,
        tipo: 'CERTIDAO_NASCIMENTO',
      },
    },
    update: {},
    create: {
      catequizandoId: catequizando2.id,
      tipo: 'CERTIDAO_NASCIMENTO',
      status: true,
      uploadDate: new Date('2024-10-15'),
    },
  });

  await prisma.catequizandoDocumento.upsert({
    where: {
      catequizandoId_tipo: {
        catequizandoId: catequizando2.id,
        tipo: 'CPF',
      },
    },
    update: {},
    create: {
      catequizandoId: catequizando2.id,
      tipo: 'CPF',
      status: false,
      uploadDate: null,
    },
  });

  await prisma.catequizandoDocumento.upsert({
    where: {
      catequizandoId_tipo: {
        catequizandoId: catequizando2.id,
        tipo: 'CARTEIRA_VACINA',
      },
    },
    update: {},
    create: {
      catequizandoId: catequizando2.id,
      tipo: 'CARTEIRA_VACINA',
      status: true,
      uploadDate: new Date('2024-10-20'),
    },
  });

  // Criar evento
  const evento = await prisma.evento.create({
    data: {
      titulo: 'Missa de Primeira Comunhão',
      descricao: 'Cerimônia de primeira comunhão das turmas 2024',
      data: new Date('2024-12-15T10:00:00'),
      tipo: 'GERAL',
    },
  });
  console.log('✅ Evento criado:', evento.titulo);

  // Criar música
  const musica = await prisma.musica.create({
    data: {
      titulo: 'Eu Vim Para Adorar-te',
      autor: 'Comunidade Católica Shalom',
      linkExterno: 'https://youtube.com/watch?v=exemplo',
      notas: 'Tom: G',
    },
  });
  console.log('✅ Música criada:', musica.titulo);

  console.log('\n🎉 Seed concluído!');
  console.log('\n📝 Credenciais de acesso:');
  console.log('   Admin: admin@catequese.com / 123');
  console.log('   Responsável: pai@catequese.com / parent123');
  console.log('   Catequista Ana: ana.catequista@catequese.com / ana123');
  console.log('   Catequista Carlos: carlos.catequista@catequese.com / carlos123');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao fazer seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

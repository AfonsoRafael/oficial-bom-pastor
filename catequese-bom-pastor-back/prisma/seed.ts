import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
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

  console.log('\n🎉 Seed concluído!');
  console.log('\n📝 Credenciais de acesso:');
  console.log('   Admin: admin@catequese.com / admin123');
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

  // Criar eventos variados
  const eventos = [
    {
      titulo: 'Missa de Primeira Comunhão',
      descricao: 'Cerimônia de primeira comunhão das turmas 2024',
      data: new Date('2025-06-15T10:00:00Z'),
      horaInicio: '10:00',
      horaFim: '12:00',
      local: 'Matriz da Paróquia',
      categoria: 'CELEBRACAO',
      cor: '#EAB308',
      tipo: 'GERAL',
    },
    {
      titulo: 'Encontro de Catequese - Nível I',
      descricao: 'Tema: Conhecendo Jesus - Parábola do Bom Pastor',
      data: new Date('2025-03-08T09:00:00Z'),
      horaInicio: '09:00',
      horaFim: '11:00',
      local: 'Salão Paroquial - Sala 1',
      categoria: 'ENCONTRO',
      cor: '#3B82F6',
      recorrencia: 'SEMANAL',
      tipo: 'TURMA',
      turmaId: turma2024.id,
    },
    {
      titulo: 'Encontro de Catequese - Nível II',
      descricao: 'Tema: Os Sacramentos - Eucaristia',
      data: new Date('2025-03-08T14:00:00Z'),
      horaInicio: '14:00',
      horaFim: '16:00',
      local: 'Salão Paroquial - Sala 2',
      categoria: 'ENCONTRO',
      cor: '#3B82F6',
      recorrencia: 'SEMANAL',
      tipo: 'TURMA',
      turmaId: turma2025.id,
    },
    {
      titulo: 'Reunião de Pais e Mestres',
      descricao: 'Reunião bimestral com os responsáveis para alinhamento do cronograma',
      data: new Date('2025-03-15T19:00:00Z'),
      horaInicio: '19:00',
      horaFim: '21:00',
      local: 'Salão Paroquial',
      categoria: 'REUNIAO',
      cor: '#F97316',
      tipo: 'GERAL',
    },
    {
      titulo: 'Retiro Espiritual de Páscoa',
      descricao: 'Retiro de preparação para a Páscoa com todas as turmas',
      data: new Date('2025-04-12T08:00:00Z'),
      dataFim: new Date('2025-04-12T17:00:00Z'),
      horaInicio: '08:00',
      horaFim: '17:00',
      local: 'Centro de Retiros São José',
      categoria: 'RETIRO',
      cor: '#22C55E',
      tipo: 'GERAL',
    },
    {
      titulo: 'Feriado: Semana Santa',
      descricao: 'Semana Santa - Não haverá encontros de catequese',
      data: new Date('2025-04-14T00:00:00Z'),
      dataFim: new Date('2025-04-20T23:59:00Z'),
      categoria: 'FERIADO',
      cor: '#EF4444',
      tipo: 'GERAL',
    },
  ];

  for (const eventoData of eventos) {
    const evento = await prisma.evento.create({ data: eventoData });
    console.log(`✅ Evento criado: ${evento.titulo}`);
  }
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

  // Criar itens da lojinha
  console.log('🛍️ Criando itens da lojinha...');
  const items = [
    {
      id: 'seed-item-1',
      nome: 'Camiseta da Catequese',
      descricao: 'Camiseta oficial com logo Bom Pastor',
      preco: 45.0,
      estoque: 50,
      imagemUrl: '🎽',
    },
    {
      id: 'seed-item-2',
      nome: 'Caneca Personalizada',
      descricao: 'Caneca com versículos bíblicos',
      preco: 30.0,
      estoque: 30,
      imagemUrl: '☕',
    },
    {
      id: 'seed-item-3',
      nome: 'Terço Infantil',
      descricao: 'Terço colorido para crianças',
      preco: 15.0,
      estoque: 100,
      imagemUrl: '📿',
    },
    {
      id: 'seed-item-4',
      nome: 'Chaveiro Bom Pastor',
      descricao: 'Chaveiro com imagem do Bom Pastor',
      preco: 10.0,
      estoque: 200,
      imagemUrl: '🔑',
    },
    {
      id: 'seed-item-5',
      nome: 'Apostila de Catequese',
      descricao: 'Material didático completo',
      preco: 25.0,
      estoque: 150,
      imagemUrl: '📖',
    },
    {
      id: 'seed-item-6',
      nome: 'Kit de Adesivos',
      descricao: 'Adesivos religiosos infantis',
      preco: 12.0,
      estoque: 80,
      imagemUrl: '✨',
    },
  ];

  for (const item of items) {
    await prisma.lojaItem.upsert({
      where: { id: item.id },
      update: {
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco,
        estoque: item.estoque,
        imagemUrl: item.imagemUrl,
      },
      create: item,
    });
  }
  console.log('✅ Itens da lojinha criados');

>>>>>>> origin/correcoes-afonso:back/prisma/seed.ts
  console.log('\n🎉 Seed concluído!');
  console.log('\n📝 Credenciais de acesso:');
  console.log('   Admin: admin@catequese.com / admin123');
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

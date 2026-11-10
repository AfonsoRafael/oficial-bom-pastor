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

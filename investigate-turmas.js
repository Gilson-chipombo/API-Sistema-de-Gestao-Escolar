const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateTurmas() {
  try {
    console.log('📊 INVESTIGAÇÃO DE TURMAS\n');

    // 1. Listar todas as turmas existentes
    const allTurmas = await prisma.turma.findMany({
      select: { id_turma: true, sigla_turma: true }
    });
    
    console.log('✅ Turmas existentes no banco:');
    console.log(`   Total: ${allTurmas.length}`);
    allTurmas.forEach(t => console.log(`   • ID ${t.id_turma}: ${t.sigla_turma}`));

    // 2. Listar professor logado com IDs de turma
    const professores = await prisma.professor.findMany({
      include: {
        turmas: {
          select: { turma_id: true }
        },
        turmas_dirigidas: {
          select: { id_turma: true }
        },
        usuario: {
          select: { id_usuario: true, user_name: true }
        }
      }
    });

    console.log('\n👨‍🏫 Professores e suas turmas:');
    professores.forEach(prof => {
      console.log(`\n   Professor: ${prof.nome_prof} (ID: ${prof.id_prof})`);
      console.log(`   Usuário: ${prof.usuario?.user_name || 'Sem usuário'} (ID: ${prof.usuario?.id_usuario || '-'})`);
      console.log(`   Turmas (ProfessorTurma): [${prof.turmas.map(t => t.turma_id).join(', ') || 'nenhuma'}]`);
      console.log(`   Turmas Dirigidas: [${prof.turmas_dirigidas.map(t => t.id_turma).join(', ') || 'nenhuma'}]`);
    });

    // 3. Tentar encontrar turma 6 diretamente
    console.log('\n🔍 Procurando turma ID 6:');
    const turma6 = await prisma.turma.findUnique({
      where: { id_turma: 6 }
    });
    console.log(turma6 ? '   ✗ ENCONTRADA (inesperado!)' : '   ✓ NÃO EXISTE (comportamento esperado)');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigateTurmas();

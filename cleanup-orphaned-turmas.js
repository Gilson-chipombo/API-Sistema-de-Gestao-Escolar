const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOrphanedTurmas() {
  try {
    console.log('🔍 Procurando referências órfãs em ProfessorTurma...\n');

    // Encontrar todas as referências órfãs
    const orphanedReferences = await prisma.professorTurma.findMany({
      include: {
        turma: true,
        professor: true
      }
    });

    const orphaned = orphanedReferences.filter(pt => pt.turma === null);

    if (orphaned.length === 0) {
      console.log('✅ Nenhuma referência órfã encontrada!');
      return;
    }

    console.log(`⚠️  Encontradas ${orphaned.length} referências órfãs:\n`);

    for (const ref of orphaned) {
      console.log(`   • Professor ID ${ref.professor_id} → Turma ID (inexistente) ${ref.turma_id}`);
      console.log(`     Professor: ${ref.professor?.nome_prof || 'Desconhecido'}`);
    }

    console.log('\n🗑️  Deletando referências órfãs...');

    // Deletar referências órfãs
    const deleteResult = await prisma.professorTurma.deleteMany({
      where: {
        turma_id: {
          notIn: (await prisma.turma.findMany({ select: { id_turma: true } })).map(t => t.id_turma)
        }
      }
    });

    console.log(`✅ ${deleteResult.count} referências deletadas com sucesso!\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedTurmas();

import { PrismaClient, PerfilUsuario, StatusUsuario, NivelAcademico, StatusProfessor, StatusEstudante, TipoFalta, DestinatarioAviso, PrioridadeAviso, TipoEnsino } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Iniciando seed...');

  // ── Utilizadores ──────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@escola.ao' },
    update: {},
    create: {
      user_name: 'Administrador',
      email: 'admin@escola.ao',
      password: adminPass,
      perfil: PerfilUsuario.ADMIN,
      status: StatusUsuario.ATIVO,
    },
  });
  console.log('✅  Admin criado:', admin.email);

  const secPass = await bcrypt.hash('sec123', 10);
  await prisma.usuario.upsert({
    where: { email: 'secretaria@escola.ao' },
    update: {},
    create: {
      user_name: 'Secretaria Geral',
      email: 'secretaria@escola.ao',
      password: secPass,
      perfil: PerfilUsuario.SECRETARIA,
      status: StatusUsuario.ATIVO,
    },
  });
  console.log('✅  Secretaria criada');

  // ── Classes ───────────────────────────────────────────
  const classeInf = await prisma.classe.upsert({
    where: { id_classe: 1 },
    update: {},
    create: { sigla_classe: '10ª', descricao_classe: 'Décima Classe - Informática', nomeCurso: 'Informática', tipoEnsino: TipoEnsino.MEDIO },
  });
  const classeGest = await prisma.classe.upsert({
    where: { id_classe: 2 },
    update: {},
    create: { sigla_classe: '10ª', descricao_classe: 'Décima Classe - Gestão', nomeCurso: 'Gestão e Administração', tipoEnsino: TipoEnsino.MEDIO },
  });
  console.log('✅  Classes criadas');

  // ── Disciplinas ───────────────────────────────────────
  const disciplinas = [
    { sigla_disc: 'MAT', descricao_disc: 'Matemática' },
    { sigla_disc: 'PORT', descricao_disc: 'Língua Portuguesa' },
    { sigla_disc: 'FIS', descricao_disc: 'Física' },
    { sigla_disc: 'QUIM', descricao_disc: 'Química' },
    { sigla_disc: 'HIS', descricao_disc: 'História' },
    { sigla_disc: 'GEO', descricao_disc: 'Geografia' },
    { sigla_disc: 'BIO', descricao_disc: 'Biologia' },
    { sigla_disc: 'INF', descricao_disc: 'Informática' },
  ];

  for (const d of disciplinas) {
    await prisma.disciplina.upsert({
      where: { sigla_disc: d.sigla_disc },
      update: {},
      create: d,
    });
  }
  console.log('✅  Disciplinas criadas');

  // ── Associar Disciplinas às Classes ───────────────────
  // Buscar disciplinas criadas
  const allDisciplinas = await prisma.disciplina.findMany();
  
  // Disciplinas para a classe de Informática
  const disciplinasInformatica = allDisciplinas.filter(d => 
    ['MAT', 'PORT', 'FIS', 'QUIM', 'INF'].includes(d.sigla_disc)
  );
  
  // Remover associações antigas
  await prisma.classeDisciplina.deleteMany({ where: { classe_id: classeInf.id_classe } });
  
  // Criar novas associações
  for (let i = 0; i < disciplinasInformatica.length; i++) {
    await prisma.classeDisciplina.create({
      data: {
        classe_id: classeInf.id_classe,
        disciplina_id: disciplinasInformatica[i].id_disc,
        ordem: i + 1,
      },
    });
  }
  console.log('✅  Disciplinas associadas à classe Informática');

  // ── Professor ─────────────────────────────────────────
  const profPass = await bcrypt.hash('prof123', 10);
  const profUsuario = await prisma.usuario.upsert({
    where: { email: 'prof.silva@escola.ao' },
    update: {},
    create: {
      user_name: 'Prof. António Silva',
      email: 'prof.silva@escola.ao',
      password: profPass,
      perfil: PerfilUsuario.PROFESSOR,
      status: StatusUsuario.ATIVO,
    },
  });

  const professor = await prisma.professor.upsert({
    where: { numero_bi_prof: '004567890LA042' },
    update: {},
    create: {
      nome_prof: 'António Silva',
      data_nascimento_prof: new Date('1980-05-15'),
      telefone_prof: '923000001',
      numero_bi_prof: '004567890LA042',
      data_emissao_bi_prof: new Date('2018-01-10'),
      endereco_fisico_prof: 'Rua da Missão, nº 5, Luanda',
      naturalidade_prof: 'Luanda',
      nivel_academico: NivelAcademico.LICENCIATURA,
      area_formacao_prof: 'Matemática',
      status: StatusProfessor.ATIVO,
      usuario_id: profUsuario.id_usuario,
    },
  });
  console.log('✅  Professor criado:', professor.nome_prof);

  // ── Professores Adicionais ────────────────────────────
  const prof2Pass = await bcrypt.hash('prof2123', 10);
  const prof2Usuario = await prisma.usuario.upsert({
    where: { email: 'joana.costa@escola.ao' },
    update: {},
    create: {
      user_name: 'Joana Costa',
      email: 'joana.costa@escola.ao',
      password: prof2Pass,
      perfil: PerfilUsuario.PROFESSOR,
      status: StatusUsuario.ATIVO,
    },
  });

  const professor2 = await prisma.professor.upsert({
    where: { numero_bi_prof: '001234567LA001' },
    update: {},
    create: {
      nome_prof: 'Joana Costa',
      data_nascimento_prof: new Date('1985-08-20'),
      telefone_prof: '923000002',
      numero_bi_prof: '001234567LA001',
      data_emissao_bi_prof: new Date('2016-05-15'),
      endereco_fisico_prof: 'Bairro Miramar, Luanda',
      naturalidade_prof: 'Benguela',
      nivel_academico: NivelAcademico.LICENCIATURA,
      area_formacao_prof: 'Português',
      status: StatusProfessor.ATIVO,
      usuario_id: prof2Usuario.id_usuario,
    },
  });
  console.log('✅  Professor 2 criado:', professor2.nome_prof);

  const prof3Pass = await bcrypt.hash('prof3123', 10);
  const prof3Usuario = await prisma.usuario.upsert({
    where: { email: 'carlos.dias@escola.ao' },
    update: {},
    create: {
      user_name: 'Carlos Dias',
      email: 'carlos.dias@escola.ao',
      password: prof3Pass,
      perfil: PerfilUsuario.PROFESSOR,
      status: StatusUsuario.ATIVO,
    },
  });

  const professor3 = await prisma.professor.upsert({
    where: { numero_bi_prof: '002345678LA002' },
    update: {},
    create: {
      nome_prof: 'Carlos Dias',
      data_nascimento_prof: new Date('1978-12-10'),
      telefone_prof: '923000003',
      numero_bi_prof: '002345678LA002',
      data_emissao_bi_prof: new Date('2015-08-22'),
      endereco_fisico_prof: 'Bairro Talatona, Luanda',
      naturalidade_prof: 'Luanda',
      nivel_academico: NivelAcademico.LICENCIATURA,
      area_formacao_prof: 'Física',
      status: StatusProfessor.ATIVO,
      usuario_id: prof3Usuario.id_usuario,
    },
  });
  console.log('✅  Professor 3 criado:', professor3.nome_prof);

  // ── Estudante com Usuário ─────────────────────────────
  const estudantePass = await bcrypt.hash('aluno123', 10);
  const estudanteUsuario = await prisma.usuario.upsert({
    where: { email: 'maria.ferreira@escola.ao' },
    update: {},
    create: {
      user_name: 'Maria João Ferreira',
      email: 'maria.ferreira@escola.ao',
      password: estudantePass,
      perfil: PerfilUsuario.ESTUDANTE,
      status: StatusUsuario.ATIVO,
    },
  });
  console.log('✅  Usuário Estudante criado:', estudanteUsuario.email);

  // ── Turma ─────────────────────────────────────────────
  const turma = await prisma.turma.create({
    data: {
      sigla_turma: 'A',
      ano_lectivo_turma: 2025,
      turno_turma: 'Manhã',
      classe_turma: '10ª',
      sala_turma: 'Sala 01',
      classe_id: classeInf.id_classe,
      diretor_turma: professor.id_prof,
      numero_aluno_turma: 35,
    },
  });
  console.log('✅  Turma criada:', `${turma.classe_turma} ${turma.sigla_turma}`);

  // ── Estudante ─────────────────────────────────────────
  const estudante = await prisma.estudante.upsert({
    where: { numero_bi_estudante: '005112233LA041' },
    update: {},
    create: {
      nome_estudante: 'Maria João Ferreira',
      data_nascimento: new Date('2007-03-22'),
      naturalidade_estudante: 'Luanda',
      numero_bi_estudante: '005112233LA041',
      endereco_fisico_estudante: 'Bairro Miramar, Luanda',
      turma_id: turma.id_turma,
      status: StatusEstudante.ATIVO,
    },
  });
  console.log('✅  Estudante criado:', estudante.nome_estudante);

  // ── Notas de exemplo ──────────────────────────────────
  const disciplinasArray = await prisma.disciplina.findMany();
  const notasExemplo = [
    { disc: 'MAT', trimestre: 1, mac: 14.5, pp: 13.0, pt: 15.0 },
    { disc: 'PORT', trimestre: 1, mac: 15.0, pp: 14.0, pt: 14.5 },
    { disc: 'FIS', trimestre: 1, mac: 13.5, pp: 12.5, pt: 14.0 },
    { disc: 'QUIM', trimestre: 1, mac: 14.0, pp: 13.5, pt: 13.5 },
    { disc: 'BIO', trimestre: 1, mac: 15.5, pp: 15.0, pt: 16.0 },
  ];

  for (const nota of notasExemplo) {
    const disc = disciplinasArray.find(d => d.sigla_disc === nota.disc);
    if (disc) {
      await prisma.nota.create({
        data: {
          estudante_id: estudante.id_estudante,
          disciplina_id: disc.id_disc,
          turma_id: turma.id_turma,
          trimestre_nota: nota.trimestre,
          mac_notas: nota.mac,
          pp_notas: nota.pp,
          pt_notas: nota.pt,
          ano_letivo: 2025,
        },
      });
    }
  }
  console.log('✅  Notas de exemplo criadas');

  // ── Faltas de exemplo ─────────────────────────────────
  const faltasExemplo = [
    { disc: 'MAT', count: 2 },
    { disc: 'PORT', count: 1 },
    { disc: 'FIS', count: 0 },
    { disc: 'QUIM', count: 1 },
    { disc: 'BIO', count: 1 },
  ];

  for (const falta of faltasExemplo) {
    const disc = disciplinasArray.find(d => d.sigla_disc === falta.disc);
    if (disc) {
      for (let i = 0; i < falta.count; i++) {
        await prisma.falta.create({
          data: {
            estudante_id: estudante.id_estudante,
            disciplina_id: disc.id_disc,
            turma_id: turma.id_turma,
            data_falta: new Date(2025, 10, Math.floor(Math.random() * 20) + 1),
            tipo_falta: TipoFalta.INJUSTIFICADA,
           // professor_id: professor.id_prof,
          },
        });
      }
    }
  }
  console.log('✅  Faltas de exemplo criadas');

  // ── Avisos ────────────────────────────────────────────
  const hoje = new Date();
  const ontemMeia = new Date(hoje.getTime() - 24 * 60 * 60 * 1000); // ontem
  const tresDispasAtras = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 dias atrás
  
  await prisma.aviso.create({
    data: {
      titulo: 'Bem-vindos ao ano lectivo 2025',
      conteudo: 'A direcção da escola dá as boas-vindas a todos os estudantes, professores e encarregados de educação para o ano lectivo 2025.',
      destinatarios: DestinatarioAviso.TODOS,
      data_publicacao: hoje,
      prioridade: PrioridadeAviso.ALTA,
      professor_id: admin.id_usuario,
    },
  });

  await prisma.aviso.create({
    data: {
      titulo: 'Reunião de Pais e Encarregados',
      conteudo: 'Informamos que está marcada a reunião trimestral de pais e encarregados de educação para o próximo sábado às 10:00.',
      destinatarios: DestinatarioAviso.TODOS,
      data_publicacao: ontemMeia,
      prioridade: PrioridadeAviso.MEDIA,
      professor_id: admin.id_usuario,
    },
  });

  await prisma.aviso.create({
    data: {
      titulo: 'Resultados Parciais Disponíveis',
      conteudo: 'Os resultados parciais do primeiro trimestre estão disponíveis no portal. Aceda para consultar as notas.',
      destinatarios: DestinatarioAviso.ESTUDANTES,
      data_publicacao: tresDispasAtras,
      prioridade: PrioridadeAviso.ALTA,
    //  professor_id: professor.id_usuario,
    },
  });

  console.log('✅  Avisos criados');

  console.log('\n🎉  Seed concluído com sucesso!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Credenciais de acesso:');
  console.log('  Admin:      admin@escola.ao            / admin123');
  console.log('  Secretaria: secretaria@escola.ao       / sec123');
  console.log('  Professor:  prof.silva@escola.ao       / prof123');
  console.log('  Estudante:  maria.ferreira@escola.ao   / aluno123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

# Sistema de Gestão Escolar

API RESTful construída com **NestJS + Prisma + PostgreSQL**.

---

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

---

## Instalação e Arranque

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite o ficheiro `.env` com as suas credenciais do PostgreSQL:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/school_management?schema=public"
JWT_SECRET="mude_esta_chave_em_producao"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Gerar o cliente Prisma
```bash
npm run prisma:generate
```

### 4. Executar as migrações (cria as tabelas)
```bash
npm run prisma:migrate
```
> Quando pedido, dê um nome à migração, ex: `init`

### 5. Popular a base de dados com dados iniciais
```bash
npm run prisma:seed
```

### 6. Arrancar o servidor
```bash
# Desenvolvimento (hot reload)
npm run start:dev

# Produção
npm run build && npm run start:prod
```

---

## 🌐 Acesso

| Recurso       | URL                                      |
|---------------|------------------------------------------|
| API Base      | http://localhost:3000/api/v1             |
| Swagger Docs  | http://localhost:3000/api/docs           |
| Prisma Studio | `npm run prisma:studio` → localhost:5555 |

---

## 🔐 Autenticação

A API usa **JWT Bearer Token**.

### Login
```http
POST /api/v1/usuarios/login
Content-Type: application/json

{
  "email": "admin@escola.ao",
  "password": "admin123"
}
```
**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "perfil": "ADMIN",
  "user_name": "Administrador"
}
```

Use o token em todos os pedidos seguintes:
```
Authorization: Bearer <access_token>
```

### Credenciais do Seed

| Perfil      | Email                      | Password |
|-------------|----------------------------|----------|
| ADMIN       | admin@escola.ao            | admin123 |
| SECRETARIA  | secretaria@escola.ao       | sec123   |
| PROFESSOR   | prof.silva@escola.ao       | prof123  |

---

## Módulos e Endpoints

### Auth / Usuários `/api/v1/usuarios`
| Método | Endpoint              | Descrição              | Perfis          |
|--------|-----------------------|------------------------|-----------------|
| POST   | `/login`              | Autenticação           | Público         |
| POST   | `/`                   | Criar utilizador       | ADMIN           |
| GET    | `/`                   | Listar utilizadores    | ADMIN           |
| GET    | `/:id`                | Detalhe do utilizador  | Autenticado     |
| DELETE | `/:id`                | Desactivar utilizador  | ADMIN           |

### Estudantes `/api/v1/estudantes`
| Método | Endpoint              | Descrição              | Perfis                   |
|--------|-----------------------|------------------------|--------------------------|
| POST   | `/`                   | Registar estudante     | ADMIN, SECRETARIA        |
| GET    | `/`                   | Listar (filtros)       | Autenticado              |
| GET    | `/:id`                | Detalhe + notas/faltas | Autenticado              |
| PUT    | `/:id`                | Actualizar             | ADMIN, SECRETARIA        |
| DELETE | `/:id`                | Desactivar             | ADMIN                    |

**Filtros disponíveis:** `?turmaId=&classe=&status=`

### Professores `/api/v1/professores`
| Método | Endpoint | Descrição | Perfis |
|--------|----------|-----------|--------|
| POST   | `/`      | Registar  | ADMIN, SECRETARIA |
| GET    | `/`      | Listar    | Autenticado |
| GET    | `/:id`   | Detalhe   | Autenticado |
| PUT    | `/:id`   | Actualizar| ADMIN, SECRETARIA |
| DELETE | `/:id`   | Desactivar| ADMIN |

### Turmas `/api/v1/turmas`
| Método | Endpoint | Descrição | Perfis |
|--------|----------|-----------|--------|
| POST   | `/`      | Criar     | ADMIN, SECRETARIA |
| GET    | `/`      | Listar    | Autenticado |
| GET    | `/:id`   | Detalhe + estudantes | Autenticado |
| PUT    | `/:id`   | Actualizar| ADMIN, SECRETARIA |
| DELETE | `/:id`   | Eliminar  | ADMIN |

**Filtros:** `?anoLetivo=2025&classe=10ª`

### Disciplinas `/api/v1/disciplinas`
CRUD completo. Criação/edição/remoção requer perfil **ADMIN**.

### Cursos `/api/v1/cursos`
CRUD completo. Criação/edição/remoção requer perfil **ADMIN**.

### Notas `/api/v1/notas`
| Método | Endpoint                       | Descrição              | Perfis                      |
|--------|--------------------------------|------------------------|-----------------------------|
| POST   | `/`                            | Lançar nota            | ADMIN, PROFESSOR, SECRETARIA|
| GET    | `/`                            | Listar (filtros)       | Autenticado                 |
| GET    | `/boletim/:estudanteId`        | Boletim do estudante   | Autenticado                 |
| GET    | `/:id`                         | Detalhe da nota        | Autenticado                 |
| PUT    | `/:id`                         | Actualizar             | ADMIN, PROFESSOR, SECRETARIA|
| DELETE | `/:id`                         | Remover                | ADMIN                       |

**Filtros:** `?estudanteId=&disciplinaId=&turmaId=&anoLetivo=`  
**Boletim:** `GET /boletim/1?anoLetivo=2025`

### Faltas `/api/v1/faltas`
| Método | Endpoint                    | Descrição               | Perfis                      |
|--------|-----------------------------|-------------------------|-----------------------------|
| POST   | `/`                         | Registar falta          | ADMIN, PROFESSOR, SECRETARIA|
| GET    | `/`                         | Listar (filtros)        | Autenticado                 |
| GET    | `/resumo/:estudanteId`      | Resumo agrupado         | Autenticado                 |
| GET    | `/:id`                      | Detalhe                 | Autenticado                 |
| PUT    | `/:id`                      | Actualizar              | ADMIN, PROFESSOR, SECRETARIA|
| DELETE | `/:id`                      | Remover                 | ADMIN                       |

**Resumo:** `GET /resumo/1?turmaId=1`

### Avisos `/api/v1/avisos`
| Método | Endpoint | Descrição | Perfis |
|--------|----------|-----------|--------|
| POST   | `/`      | Publicar  | ADMIN, PROFESSOR, SECRETARIA |
| GET    | `/`      | Listar    | Autenticado |
| GET    | `/:id`   | Detalhe   | Autenticado |
| PUT    | `/:id`   | Actualizar| ADMIN, PROFESSOR, SECRETARIA |
| DELETE | `/:id`   | Remover   | ADMIN |

**Filtros:** `?destinatarios=TODOS&prioridade=ALTA&apenasAtivos=true`

---

## Esquema da Base de Dados

```
Usuario ──────────── Professor
                         │
              ┌──────────┴──────────┐
              │                     │
            Turma ◄── Curso      (diretor)
              │
    ┌─────────┼──────────┐
    │         │          │
Estudante   Nota      Falta
    │         │          │
    └────┬────┘          │
         │               │
     Disciplina ─────────┘

Aviso ──► Usuario (professor_id, opcional)
```

---

## Scripts disponíveis

```bash
npm run start:dev        # Desenvolvimento com hot reload
npm run start:prod       # Produção
npm run build            # Compilar TypeScript
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrações
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:seed      # Popular BD com dados iniciais
```

---

## Estrutura do Projecto

```
src/
├── main.ts                          # Bootstrap + Swagger
├── app.module.ts                    # Módulo raiz
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── guards/
│       ├── jwt.strategy.ts
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
└── modules/
    ├── usuarios/       (auth JWT + CRUD)
    ├── estudantes/
    ├── professores/
    ├── turmas/
    ├── disciplinas/
    ├── cursos/
    ├── notas/          (boletim incluído)
    ├── faltas/         (resumo agrupado incluído)
    └── avisos/
```

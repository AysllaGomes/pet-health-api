# Pet Health API

API para gerenciamento de saúde de pets, com controle de vacinas, medicamentos, notificações e lembretes automáticos.

---

## Objetivo

O **Pet Health API** foi criado para ajudar tutores a organizarem a saúde dos seus pets, centralizando informações como:

- Vacinas
- Medicamentos
- Lembretes automáticos
- Histórico de notificações

Tudo isso com autenticação segura e isolamento de dados por usuário.

---

## Tecnologias

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- JWT (Autenticação)
- Swagger
- Jest (unit + e2e)

---
## Documentação

A documentação técnica completa do projeto está disponível na pasta `/docs`.

- [Arquitetura](./docs/architecture.md)
- [Docker](./docs/docker.md)
- [API](./docs/api.md)
- [Roadmap](./docs/roadmap.md)

---

## Diferenciais

- Autenticação com JWT
- Isolamento de dados por usuário (multi-tenant)
- Lembretes automáticos para vacinas e medicamentos
- Controle de notificações enviadas (SENT / FAILED)
- Paginação padronizada
- Testes unitários e e2e
- Healthcheck
- Documentação com Swagger

---

## Autenticação

A API utiliza JWT.

### Fluxo:

1. Criar usuário → `/users`
2. Login → `/auth/login`
3. Usar token nas rotas protegidas

```bash
Authorization: Bearer <access_token>
```

---

## Fluxo principal da aplicação

Usuário → Login → Cria Pet → Adiciona Vacinas/Medicamentos  
→ Sistema processa reminders automaticamente  
→ Notificações são registradas  
→ Usuário consulta histórico

---

## Arquitetura

```
Client
  ↓
Controllers
  ↓
Services
  ↓
Prisma ORM
  ↓
PostgreSQL

+----------------------+
|   Reminders (Cron)   |
+----------------------+
        ↓
+----------------------+
| NotificationService  |
+----------------------+
        ↓
+----------------------+
|     MailService      |
+----------------------+
```

---

# Como executar

## Opção 1: Com Docker

### Pré-requisitos
- Docker
- Docker Compose

### 1. Criar arquivo de ambiente
```bash
cp .env.docker.example .env.docker
```

### 2. Subir os containers
```bash
docker compose up --build
```

### 3. Acessar a aplicação
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

### 4. Parar containers
```bash
docker compose down
```

### 5. Resetar banco
```bash
docker compose down -v
```

---

## Estrutura Docker

O ambiente possui dois serviços:

- **api** → aplicação NestJS
- **db** → PostgreSQL

### Arquivos
- `Dockerfile`
- `docker-compose.yml`
- `.env.docker.example`

---

## Banco de dados (IMPORTANTE)

- O Docker usa um banco **separado do seu local**
- Dados não são compartilhados automaticamente
- Persistência via volume `postgres_data`

Reset completo:

```bash
docker compose down -v
```

---

## Comandos úteis Docker

### Ver logs
```bash
docker compose logs -f
```

### Logs da API
```bash
docker compose logs -f api
```

### Entrar no container
```bash
docker compose exec api sh
```

---

## Prisma no Docker

Executado automaticamente ao subir:

```bash
npx prisma generate
npx prisma migrate deploy
```

Executar manualmente:

```bash
docker compose exec api npx prisma studio
```

---

## Opção 2: Sem Docker

### Instalação
```bash
git clone <repo-url>
cd pet-health-api
npm install
```

### Configuração
```bash
cp .env.example .env
```

Preencha:

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1d
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

### Executar
```bash
npm run start:dev
```

Swagger:
http://localhost:3000/docs

---

## Testes

```bash
npm run test
npm run test:e2e
```

---

## Funcionalidades

### Usuários
- Criar usuário
- Login
- `/auth/me`

### Pets
- CRUD completo
- Isolamento por usuário

### Vacinas
- Registro de vacinas
- Controle de próxima dose

### Medicamentos
- Controle de tratamentos
- Lembretes automáticos

### Notificações
- Registro de envio
- Status SENT / FAILED

### Reminders
- Processamento automático via cron

---

## Paginação

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

---

## Healthcheck

GET /health

---

## Próximos passos

- [x] Autenticação com JWT
- [x] Módulo de medicamentos com horários
- [ ] Dashboard de próximos eventos
- [ ] Deploy em cloud
- [ ] Notificações push

---

## Autor
Projeto desenvolvido por [@AysllaGomes](https://github.com/AysllaGomes)
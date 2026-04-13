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

Authorization: Bearer <access_token>

---

## Fluxo principal da aplicação

Usuário → Login → Cria Pet → Adiciona Vacinas/Medicamentos  
→ Sistema processa reminders automaticamente  
→ Notificações são registradas  
→ Usuário consulta histórico

---

## Instalação

```bash
git clone <repo-url>
cd pet-health-api
npm install
```

---

## Configuração

```bash
cp .env.example .env
```

Preencha:

DATABASE_URL=  
JWT_SECRET=  
JWT_EXPIRES_IN=1d  
MAIL_HOST=  
MAIL_PORT=  
MAIL_USER=  
MAIL_PASS=  
MAIL_FROM=

---

## Executando

```bash
npm run start:dev
```

Swagger: http://localhost:3000/docs

---

## Testes

```bash
npm run test
npm run test:e2e
```

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

## Autor
Projeto desenvolvido por [@AysllaGomes](https://github.com/AysllaGomes)
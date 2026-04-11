# Pet Health API - Documento de Arquitetura

## 1. Visão geral

A **Pet Health API** é uma aplicação backend desenvolvida para gerenciar a saúde de pets, permitindo o cadastro de usuários, pets, vacinas e tratamentos preventivos, além do envio automático de lembretes por e-mail.

O sistema foi projetado com foco em simplicidade, organização do domínio e possibilidade de evolução para cenários mais robustos.

---

## 2. Objetivo

Centralizar o acompanhamento de eventos de saúde dos pets, como:

* Vacinas
* Antipulgas
* Vermífugos
* Lembretes automáticos por e-mail

---

## 3. Arquitetura da solução

A aplicação segue uma arquitetura em camadas baseada no **NestJS**:

* **Controllers** → entrada HTTP
* **Services** → regras de negócio
* **Prisma Service** → acesso ao banco
* **Scheduler** → processamento automático
* **Mail Service** → envio de e-mails

### Fluxo simplificado

```text
Cliente → Controller → Service → Prisma → Banco
```

### Fluxo de lembretes

```text
Cron → RemindersService → Banco → MailService → SMTP
```

---

## 4. Stack tecnológica

### Backend

* Node.js
* NestJS
* TypeScript

### Banco

* PostgreSQL
* Prisma ORM

### Outros

* Nodemailer
* @nestjs/schedule

---

## 5. Estrutura do projeto

```text
src/
├── prisma/
├── users/
├── pets/
├── vaccines/
├── mail/
└── reminders/
```

---

## 6. Modelagem do domínio

### User

Responsável pelo pet e destinatário dos e-mails.

### Pet

Animal vinculado ao usuário.

### Vaccine

Representa vacinas e tratamentos.

Campos principais:

* `name`
* `category`
* `nextDoseDate`
* `reminderDaysBefore`

### Notification

Histórico de envio de lembretes.

---

## 7. Categorias de tratamento

```ts
VACCINE
ANTIPARASITIC
DEWORMER
```

---

## 8. Regras de negócio

### Vacinas comuns (`VACCINE`)

* Envio X dias antes (`reminderDaysBefore`)

### Antipulgas (`ANTIPARASITIC`)

* 5 dias antes → comprar
* no dia → aplicar

### Vermífugo (`DEWORMER`)

* 5 dias antes → comprar
* no dia → aplicar

---

## 9. Scheduler

Utiliza:

```ts
@Cron(CronExpression.EVERY_8_HOURS)
```

Funções:

* buscar vacinas
* calcular datas de lembrete
* evitar duplicidade
* enviar e-mails

---

## 10. Controle de duplicidade

A tabela `Notification` evita:

* envio duplicado
* múltiplos disparos no mesmo dia

---

## 11. Tratamento de datas

Todas as datas são tratadas em **UTC** para evitar inconsistências de timezone.

---

## 12. Segurança

### Implementado

* Hash de senha (bcrypt)
* Validação de dados (class-validator)

### Não implementado

* JWT
* autorização
* proteção de rotas

---

## 13. Limitações

* cron depende da API rodando
* uso de SMTP simples (não ideal para produção)
* ausência de autenticação

---

## 14. Evoluções futuras

### Curto prazo

* JWT
* medicamentos com horário

### Médio prazo

* filas (BullMQ)
* deploy cloud

### Longo prazo

* dashboard
* notificações push

---

## 15. Considerações finais

A arquitetura foi construída para:

* ser simples
* evoluir facilmente
* suportar crescimento gradual

---

## 16. Autor

Pet Health API, [@AysllaGomes](https://github.com/AysllaGomes)

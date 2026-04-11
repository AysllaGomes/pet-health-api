# Pet Health API

API para gerenciamento de saúde de pets, com controle de vacinas, antipulgas, vermífugos e envio automático de lembretes por e-mail.

---

## Tecnologias

* Node.js
* NestJS
* Prisma ORM
* PostgreSQL
* Nodemailer
* @nestjs/schedule (cron jobs)

---

## Funcionalidades

### Usuários

* Criar usuário
* Listar usuários
* Atualizar usuário
* Remover usuário

### Pets

* Cadastro de pets
* Relacionamento com usuário

### Vacinas / Tratamentos

* Cadastro de vacina/remédio
* Definição de data de aplicação
* Definição de próxima dose
* Categoria do tratamento:

    * `VACCINE`
    * `ANTIPARASITIC`
    * `DEWORMER`

---

## Notificações automáticas

* Cron job executado periodicamente
* Envio de e-mails com base na regra

### Regras de lembrete

| Categoria     | Comportamento                                   |
| ------------- | ----------------------------------------------- |
| VACCINE       | Envia X dias antes (`reminderDaysBefore`)       |
| ANTIPARASITIC | Envia 5 dias antes (comprar) + no dia (aplicar) |
| DEWORMER      | Envia 5 dias antes (comprar) + no dia (aplicar) |

---

## Envio de e-mail

Utiliza **Nodemailer com SMTP (Gmail)**.

### Configuração

Crie um arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pet_health_db"

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seuemail@gmail.com
MAIL_PASS=sua_app_password
MAIL_FROM="Pet Health <seuemail@gmail.com>"
```

Importante:

* Usar **App Password do Gmail**
* Ativar verificação em duas etapas

---

## Banco de dados

### Modelo principal: Vaccine

```ts
Vaccine {
  id
  petId
  name
  category
  applicationDate
  nextDoseDate
  reminderDaysBefore
}
```

### Categorias

```ts
VACCINE
ANTIPARASITIC
DEWORMER
```

---

## Scheduler (Cron)

```ts
@Cron(CronExpression.EVERY_8_HOURS)
```

Função:

* Verificar vacinas com lembretes ativos
* Enviar e-mails
* Registrar notificações enviadas

---

## Controle de duplicidade

A tabela `Notification` é usada para:

* Evitar envio duplicado
* Registrar histórico de envio
* Armazenar status (`SENT`, `FAILED`)

---

## Como rodar o projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco

```bash
npx prisma migrate dev
```

### 3. Rodar aplicação

```bash
npm run start:dev
```

API disponível em:

```
http://localhost:3000
```

---

## Exemplos de uso

### Criar vacina comum

```json
POST /vaccines
```

```json
{
  "petId": "ID_DO_PET",
  "name": "Vacina Anual",
  "category": "VACCINE",
  "applicationDate": "2026-04-11",
  "nextDoseDate": "2027-04-11",
  "reminderDaysBefore": 7
}
```

---

### Criar antipulgas

```json
{
  "petId": "ID_DO_PET",
  "name": "Antipulgas",
  "category": "ANTIPARASITIC",
  "applicationDate": "2026-04-11",
  "nextDoseDate": "2026-04-16"
}
```

---

## Próximos passos

* [ ] Autenticação com JWT
* [ ] Módulo de medicamentos com horários
* [ ] Dashboard de próximos eventos
* [ ] Deploy em ambiente cloud
* [ ] Notificações via push

---

## Observações

* Todas as datas são tratadas em **UTC**
* O cron funciona apenas com a aplicação em execução
* Para produção, recomenda-se:

    * Uso de filas (BullMQ)
    * Workers separados
    * Serviços de e-mail dedicados (SendGrid, Resend, etc.)

---

## Autor
Projeto desenvolvido por [@AysllaGomes](https://github.com/AysllaGomes)

# Pet Health API - Arquitetura

Este documento descreve a arquitetura da **Pet Health API**, incluindo visão geral, decisões técnicas, estrutura do projeto, domínio e principais fluxos do sistema.

---

## Visão geral

A **Pet Health API** é uma aplicação backend desenvolvida com **NestJS** que permite:

* Gerenciar usuários e seus pets
* Controlar vacinas e tratamentos preventivos
* Controlar medicamentos com horários
* Enviar lembretes automáticos por e-mail

A aplicação segue princípios de:

* Separação de responsabilidades
* Baixo acoplamento
* Código orientado a domínio

---

## Stack tecnológica

* **Node.js**
* **NestJS**
* **Prisma ORM**
* **PostgreSQL**
* **Nodemailer (SMTP)**
* **@nestjs/schedule (cron jobs)**
* **Swagger (OpenAPI)**

---

## Estrutura do projeto

```text
src/
├── users/
├── pets/
├── vaccines/
├── medications/
├── mail/
├── prisma/
├── reminders/
│   ├── services/
│   │   ├── vaccine-reminder.service.ts
│   │   ├── medication-reminder.service.ts
│   │   ├── reminder-date.service.ts
│   │   └── notification.service.ts
│   └── reminders.service.ts
```

---

## Padrão arquitetural

A aplicação segue um padrão modular inspirado em **Clean Architecture**:

### Camadas principais

* **Controller**

    * Responsável por receber requisições HTTP

* **Service**

    * Contém regras de negócio

* **PrismaService**

    * Camada de acesso a dados

* **Scheduler (Reminders)**

    * Executa regras automáticas baseadas em tempo

---

## Domínio da aplicação

### User

Representa o tutor.

Campos principais:

* id
* name
* email
* password

---

### Pet

Representa um animal do usuário.

Campos principais:

* name
* species
* breed
* birthDate
* weight

---

### Vaccine

Representa:

* vacinas
* tratamentos preventivos (antipulgas, vermífugo)

Campos principais:

* name
* category (`VACCINE`, `ANTIPARASITIC`, `DEWORMER`)
* applicationDate
* nextDoseDate
* reminderDaysBefore

---

### Medication

Representa medicamentos com horário.

Campos principais:

* name
* dosage
* frequency
* startDate
* endDate
* time (HH:mm)
* reminderMinutesBefore

---

### Notification

Registra histórico de envios.

Campos principais:

* type
* referenceId
* scheduledFor
* sentAt
* status (`SENT`, `FAILED`)

---

## Sistema de lembretes

O sistema de lembretes é dividido em serviços especializados.

### Orquestrador

```text
RemindersService
```

Responsável apenas por:

* executar cron jobs
* delegar processamento

---

### Serviços especializados

#### VaccineReminderService

Responsável por:

* processar vacinas
* aplicar regras por categoria
* enviar e-mails

#### MedicationReminderService

Responsável por:

* processar medicamentos
* calcular horários
* disparar lembretes por minuto

#### ReminderDateService

Centraliza:

* cálculos de datas
* regras de tempo
* comparação de minutos

#### NotificationService

Responsável por:

* evitar duplicidade
* registrar envio
* registrar falhas

---

## Regras de negócio

### Vacinas padrão

* Envio baseado em `reminderDaysBefore`
* Exemplo: 7 dias antes da próxima dose

---

### Antipulgas e vermífugo

Regra especial:

* **BUY** → 5 dias antes (comprar)
* **APPLY** → no dia (aplicar)

---

### Medicamentos

* Baseados em horário (`time`)
* Lembrete enviado antes:

    * `time - reminderMinutesBefore`
* Comparação feita por minuto

---

## Tratamento de datas

### Vacinas

* Trabalham com datas em **UTC**
* Comparação por dia

---

### Medicamentos

* Trabalham com:

    * datas em UTC (`startDate`, `endDate`)
    * horário em **local time** (`time`)
* Comparação por minuto

---

## Prevenção de duplicidade

Antes de enviar qualquer lembrete:

* Sistema verifica se já existe um registro `SENT`
* Considera uma janela de tempo:

    * dia inteiro (vacinas)
    * ±1 minuto (medicamentos)

---

## Sistema de e-mail

Utiliza **Nodemailer** com SMTP (Gmail).

Responsável por:

* envio de lembretes
* templates simples (texto + HTML)

---

## Scheduler (cron jobs)

* Vacinas: executa a cada **8 horas**
* Medicamentos: executa a cada **1 minuto**

Importante:

* O sistema depende da aplicação estar rodando

---

## Segurança (estado atual)

* Senhas armazenadas com hash
* Sem autenticação JWT (ainda)

---

## Pontos de evolução

### Segurança

* JWT
* Guardas de rota
* Autorização por usuário

### Notificações

* Push notifications
* WhatsApp
* Provedores externos (SendGrid, Resend)

### Infraestrutura

* Deploy em cloud
* Worker separado para cron
* Filas (BullMQ)

### Produto

* Agenda (.ics)
* Dashboard frontend
* Controle de consultas veterinárias

---

## Decisões importantes

* Uso de banco relacional (PostgreSQL)
* Prisma como ORM
* Separação de lógica de lembrete por tipo
* Centralização de datas no `ReminderDateService`
* Uso de cron interno (sem fila externa inicialmente)

---

## Conclusão

A arquitetura da aplicação foi construída para:

* Ser simples de entender
* Facilitar evolução
* Separar responsabilidades corretamente
* Evitar bugs comuns (principalmente com datas e duplicidade)

O projeto já está em nível sólido para:

* portfólio profissional
* evolução para produção

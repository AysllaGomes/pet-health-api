# Pet Health API - Diagramas

Este documento reúne os principais diagramas da aplicação **Pet Health API**, cobrindo visão de contexto, módulos internos, domínio, fluxos principais e regras de lembrete.

---

## 1. Diagrama de contexto

Visão de alto nível da interação entre usuário, sistema, banco e serviço de e-mail.

```mermaid
flowchart LR
    User[Usuário / Tutor]
    API[Pet Health API]
    DB[(PostgreSQL)]
    SMTP[SMTP / Gmail]

    User -->|HTTP Requests| API
    API -->|CRUD e consultas| DB
    API -->|Envio de e-mails| SMTP
```

---

## 2. Diagrama de containers

Mostra os blocos principais da solução.

```mermaid
flowchart TB
    User[Usuário / Tutor]

    subgraph PetHealth[Pet Health API]
        RestAPI[API REST - NestJS]
        Scheduler[Scheduler - @nestjs/schedule]
        Mailer[Mail Service - Nodemailer]
        ORM[Prisma ORM]
    end

    DB[(PostgreSQL)]
    SMTP[SMTP / Gmail]

    User -->|HTTP / JSON| RestAPI
    Scheduler --> ORM
    RestAPI --> ORM
    ORM --> DB
    Scheduler --> Mailer
    Mailer --> SMTP
```

---

## 3. Diagrama de componentes

Mostra os módulos principais da aplicação e suas dependências.

```mermaid
flowchart TD
    AppModule[AppModule]

    UsersModule[UsersModule]
    PetsModule[PetsModule]
    VaccinesModule[VaccinesModule]
    MailModule[MailModule]
    RemindersModule[RemindersModule]
    PrismaModule[PrismaModule]

    PrismaService[PrismaService]
    MailService[MailService]
    RemindersService[RemindersService]

    AppModule --> UsersModule
    AppModule --> PetsModule
    AppModule --> VaccinesModule
    AppModule --> MailModule
    AppModule --> RemindersModule
    AppModule --> PrismaModule

    PrismaModule --> PrismaService
    MailModule --> MailService
    RemindersModule --> RemindersService

    UsersModule --> PrismaService
    PetsModule --> PrismaService
    VaccinesModule --> PrismaService
    RemindersModule --> PrismaService
    RemindersModule --> MailService
```

---

## 4. Estrutura resumida do projeto

```mermaid
flowchart LR
    Request[Request HTTP]
    Controller[Controller]
    Service[Service]
    Prisma[Prisma Service]
    DB[(PostgreSQL)]

    Cron[Scheduler]
    ReminderService[RemindersService]
    Mail[MailService]
    SMTP[SMTP]

    Request --> Controller
    Controller --> Service
    Service --> Prisma
    Prisma --> DB

    Cron --> ReminderService
    ReminderService --> Prisma
    ReminderService --> Mail
    Mail --> SMTP
```

---

## 5. Diagrama de domínio

Mostra as entidades principais e seus relacionamentos.

```mermaid
erDiagram
    USER ||--o{ PET : owns
    PET ||--o{ VACCINE : has
    PET ||--o{ NOTIFICATION : generates

    USER {
        string id
        string name
        string email
        string password
        datetime createdAt
        datetime updatedAt
    }

    PET {
        string id
        string userId
        string name
        string species
        string breed
        datetime birthDate
        float weight
        string notes
        datetime createdAt
        datetime updatedAt
    }

    VACCINE {
        string id
        string petId
        string name
        string category
        datetime applicationDate
        datetime nextDoseDate
        int reminderDaysBefore
        string veterinarian
        string clinic
        string notes
        datetime createdAt
        datetime updatedAt
    }

    NOTIFICATION {
        string id
        string petId
        string type
        string referenceId
        string emailTo
        datetime scheduledFor
        datetime sentAt
        string status
        string message
        datetime createdAt
        datetime updatedAt
    }
```

---

## 6. Fluxo de cadastro de usuário

```mermaid
sequenceDiagram
    actor User
    participant UsersController
    participant UsersService
    participant PrismaService
    participant PostgreSQL

    User->>UsersController: POST /users
    UsersController->>UsersService: create(dto)
    UsersService->>PrismaService: valida email + hash da senha + create
    PrismaService->>PostgreSQL: insert into User
    PostgreSQL-->>PrismaService: usuário criado
    PrismaService-->>UsersService: resultado
    UsersService-->>UsersController: resposta
    UsersController-->>User: 201 Created
```

---

## 7. Fluxo de cadastro de pet

```mermaid
sequenceDiagram
    actor User
    participant PetsController
    participant PetsService
    participant PrismaService
    participant PostgreSQL

    User->>PetsController: POST /pets
    PetsController->>PetsService: create(dto)
    PetsService->>PrismaService: validar userId
    PrismaService->>PostgreSQL: select User
    PostgreSQL-->>PrismaService: usuário encontrado
    PetsService->>PrismaService: create Pet
    PrismaService->>PostgreSQL: insert into Pet
    PostgreSQL-->>PrismaService: pet criado
    PrismaService-->>PetsService: resultado
    PetsService-->>PetsController: resposta
    PetsController-->>User: 201 Created
```

---

## 8. Fluxo de cadastro de vacina ou tratamento

```mermaid
sequenceDiagram
    actor User
    participant VaccinesController
    participant VaccinesService
    participant PrismaService
    participant PostgreSQL

    User->>VaccinesController: POST /vaccines
    VaccinesController->>VaccinesService: create(dto)
    VaccinesService->>PrismaService: validar petId
    PrismaService->>PostgreSQL: select Pet
    PostgreSQL-->>PrismaService: pet encontrado
    VaccinesService->>PrismaService: create Vaccine
    PrismaService->>PostgreSQL: insert into Vaccine
    PostgreSQL-->>PrismaService: vacina criada
    PrismaService-->>VaccinesService: resultado
    VaccinesService-->>VaccinesController: resposta
    VaccinesController-->>User: 201 Created
```

---

## 9. Fluxo geral do scheduler

Mostra o comportamento do cron.

```mermaid
sequenceDiagram
    participant Cron
    participant RemindersService
    participant PrismaService
    participant PostgreSQL
    participant MailService
    participant SMTP

    Cron->>RemindersService: executa scheduler
    RemindersService->>PrismaService: buscar vacinas com nextDoseDate
    PrismaService->>PostgreSQL: select vaccines
    PostgreSQL-->>PrismaService: lista de vacinas
    PrismaService-->>RemindersService: vacinas

    loop para cada vacina
        RemindersService->>RemindersService: calcular reminder plans
        RemindersService->>PrismaService: verificar Notification
        PrismaService->>PostgreSQL: select notification
        PostgreSQL-->>PrismaService: resultado
        PrismaService-->>RemindersService: existe / não existe

        alt elegível e não enviado
            RemindersService->>MailService: sendVaccineReminder(...)
            MailService->>SMTP: sendMail
            SMTP-->>MailService: accepted
            MailService-->>RemindersService: sucesso
            RemindersService->>PrismaService: criar Notification SENT
            PrismaService->>PostgreSQL: insert notification
        else já enviado ou não elegível
            RemindersService->>RemindersService: ignorar
        end
    end
```

---

## 10. Regras de lembrete por categoria

```mermaid
flowchart TD
    Start[Início]
    Category{Categoria}

    Default[VACCINE]
    Special[ANTIPARASITIC ou DEWORMER]

    DefaultRule[Enviar reminderDaysBefore dias antes]
    BuyRule[Enviar 5 dias antes para comprar]
    ApplyRule[Enviar no dia para aplicar]

    Start --> Category
    Category -->|VACCINE| Default
    Category -->|ANTIPARASITIC / DEWORMER| Special

    Default --> DefaultRule
    Special --> BuyRule
    Special --> ApplyRule
```

---

## 11. Fluxo de cálculo de lembretes

```mermaid
flowchart TD
    A[Início]
    B[Recebe vaccine]
    C{Categoria especial?}
    D[Calcular data padrão usando reminderDaysBefore]
    E[Calcular BUY = nextDoseDate - 5 dias]
    F[Calcular APPLY = nextDoseDate]
    G[Retornar 1 plano DEFAULT]
    H[Retornar 2 planos: BUY e APPLY]

    A --> B
    B --> C
    C -->|Não| D
    D --> G
    C -->|Sim| E
    E --> F
    F --> H
```

---

## 12. Fluxo de prevenção de duplicidade

```mermaid
flowchart TD
    A[Cron encontra lembrete elegível]
    B[Verifica Notification com status SENT]
    C{Já existe envio hoje?}
    D[Ignora envio]
    E[Envia e-mail]
    F[Grava Notification SENT]
    G[Grava Notification FAILED]

    A --> B
    B --> C
    C -->|Sim| D
    C -->|Não| E
    E -->|Sucesso| F
    E -->|Erro| G
```

---

## 13. Fluxo de envio de e-mail

```mermaid
sequenceDiagram
    participant RemindersService
    participant MailService
    participant SMTP

    RemindersService->>MailService: sendVaccineReminder(params)
    MailService->>MailService: montar subject/text/html
    MailService->>SMTP: sendMail(message)
    SMTP-->>MailService: accepted / error
    MailService-->>RemindersService: sucesso / falha
```

---

## 14. Fluxo específico para antipulgas e vermífugo

```mermaid
sequenceDiagram
    participant Cron
    participant RemindersService
    participant MailService
    participant Notification

    Cron->>RemindersService: processar item ANTIPARASITIC/DEWORMER
    RemindersService->>RemindersService: gerar plano BUY (D-5)
    RemindersService->>RemindersService: gerar plano APPLY (D0)

    alt Hoje = D-5
        RemindersService->>MailService: enviar lembrete BUY
        MailService-->>RemindersService: sucesso
        RemindersService->>Notification: registrar SENT BUY
    else Hoje = D0
        RemindersService->>MailService: enviar lembrete APPLY
        MailService-->>RemindersService: sucesso
        RemindersService->>Notification: registrar SENT APPLY
    else Fora da janela
        RemindersService->>RemindersService: ignorar
    end
```

---

## 15. Fluxo específico para vacina comum

```mermaid
sequenceDiagram
    participant Cron
    participant RemindersService
    participant MailService
    participant Notification

    Cron->>RemindersService: processar item VACCINE
    RemindersService->>RemindersService: calcular nextDoseDate - reminderDaysBefore

    alt Hoje = data calculada
        RemindersService->>MailService: enviar lembrete DEFAULT
        MailService-->>RemindersService: sucesso
        RemindersService->>Notification: registrar SENT DEFAULT
    else Fora da janela
        RemindersService->>RemindersService: ignorar
    end
```

---

## 16. Diagrama de estados da notificação

```mermaid
stateDiagram-v2
    [*] --> Pendente
    Pendente --> Enviada: e-mail enviado com sucesso
    Pendente --> Falha: erro no envio
    Falha --> Pendente: nova tentativa futura
    Enviada --> [*]
```

---

## 17. Pontos de evolução

```mermaid
mindmap
  root((Pet Health API))
    Segurança
      JWT
      Proteção de rotas
      Autorização por usuário
    Domínio
      Medications com horário
      Appointments
      Dashboard
    Infraestrutura
      Deploy cloud
      Filas com BullMQ
      Worker separado
    Notificações
      Push
      WhatsApp
      Provedor dedicado de e-mail
```

---

## 18. Observações

* Os diagramas refletem a arquitetura atual do projeto.
* As datas são tratadas em UTC para evitar inconsistências.
* O scheduler depende da aplicação estar em execução.
* A entidade `Vaccine` atualmente concentra vacinas e tratamentos preventivos.

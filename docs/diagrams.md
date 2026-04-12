# Pet Health API - Diagramas

Este documento reúne os principais diagramas da aplicação **Pet Health API**, cobrindo visão de contexto, módulos internos, domínio, fluxos principais e regras de lembrete.

---

## 1. Diagrama de contexto

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
    RestAPI --> ORM
    Scheduler --> ORM
    Scheduler --> Mailer
    ORM --> DB
    Mailer --> SMTP
```

---

## 3. Diagrama de componentes

```mermaid
flowchart TD
    AppModule[AppModule]

    UsersModule[UsersModule]
    PetsModule[PetsModule]
    VaccinesModule[VaccinesModule]
    MedicationsModule[MedicationsModule]
    MailModule[MailModule]
    RemindersModule[RemindersModule]
    PrismaModule[PrismaModule]

    PrismaService[PrismaService]
    MailService[MailService]
    RemindersService[RemindersService]

    VaccineReminderService[VaccineReminderService]
    MedicationReminderService[MedicationReminderService]
    ReminderDateService[ReminderDateService]
    NotificationService[NotificationService]

    AppModule --> UsersModule
    AppModule --> PetsModule
    AppModule --> VaccinesModule
    AppModule --> MedicationsModule
    AppModule --> MailModule
    AppModule --> RemindersModule
    AppModule --> PrismaModule

    PrismaModule --> PrismaService
    MailModule --> MailService
    RemindersModule --> RemindersService
    RemindersModule --> VaccineReminderService
    RemindersModule --> MedicationReminderService
    RemindersModule --> ReminderDateService
    RemindersModule --> NotificationService
```

---

## 4. Diagrama de domínio

```mermaid
erDiagram
    USER ||--o{ PET : owns
    PET ||--o{ VACCINE : has
    PET ||--o{ MEDICATION : has
    PET ||--o{ NOTIFICATION : generates
```

---

## 5. Fluxo de lembrete de vacina

```mermaid
sequenceDiagram
    participant Cron
    participant RemindersService
    participant VaccineReminderService
    participant ReminderDateService
    participant NotificationService
    participant MailService

    Cron->>RemindersService: executa job
    RemindersService->>VaccineReminderService: process()

    VaccineReminderService->>ReminderDateService: build plans

    alt Data coincide
        VaccineReminderService->>NotificationService: verifica duplicidade
        alt Não enviado
            VaccineReminderService->>MailService: envia email
            VaccineReminderService->>NotificationService: registra envio
        else Já enviado
            VaccineReminderService->>VaccineReminderService: ignora
        end
    else Fora da data
        VaccineReminderService->>VaccineReminderService: ignora
    end
```

---

## 6. Fluxo de lembrete de medicamento

```mermaid
sequenceDiagram
    participant Cron
    participant RemindersService
    participant MedicationReminderService
    participant ReminderDateService
    participant NotificationService
    participant MailService

    Cron->>RemindersService: executa job
    RemindersService->>MedicationReminderService: process()

    MedicationReminderService->>ReminderDateService: calcula horário

    alt Mesmo minuto
        MedicationReminderService->>NotificationService: verifica duplicidade
        alt Não enviado
            MedicationReminderService->>MailService: envia email
            MedicationReminderService->>NotificationService: registra envio
        else Já enviado
            MedicationReminderService->>MedicationReminderService: ignora
        end
    else Fora da janela
        MedicationReminderService->>MedicationReminderService: ignora
    end
```

---

## 7. Regras de negócio

```mermaid
flowchart TD
    Start[Início]
    Category{Categoria}

    Default[VACCINE]
    Special[ANTIPARASITIC / DEWORMER]

    DefaultRule[ReminderDaysBefore]
    BuyRule[5 dias antes]
    ApplyRule[No dia]

    Start --> Category
    Category --> Default
    Category --> Special

    Default --> DefaultRule
    Special --> BuyRule
    Special --> ApplyRule
```

---

## 8. Prevenção de duplicidade

```mermaid
flowchart TD
    A[Encontrou lembrete]
    B[Consulta Notification]
    C{Já enviado?}
    D[Ignora]
    E[Envia email]
    F[Registra sucesso]
    G[Registra falha]

    A --> B
    B --> C
    C -->|Sim| D
    C -->|Não| E
    E -->|OK| F
    E -->|Erro| G
```

---

## 9. Observações

* Vacinas usam datas em UTC
* Medicamentos usam horário local
* Scheduler depende da aplicação rodando
* Sistema evita duplicidade de envio
* Estrutura baseada em separação de responsabilidades

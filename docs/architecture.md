# Architecture — Pet Health API

## Visão geral

O **Pet Health API** foi estruturado seguindo princípios de separação de responsabilidades, modularização e escalabilidade, utilizando **NestJS** como base da aplicação, **Prisma ORM** para acesso a dados e **PostgreSQL** como banco relacional.

A arquitetura foi pensada para permitir:

- crescimento modular da aplicação
- manutenção facilitada
- isolamento de regras de negócio
- automação de rotinas com agendamento
- execução padronizada em ambiente local e containerizado

---

## Objetivos arquiteturais

Os principais objetivos da arquitetura são:

- organizar o domínio em módulos independentes
- centralizar regras de negócio na camada de serviço
- proteger dados por autenticação e escopo de usuário
- manter a aplicação pronta para expansão
- facilitar execução local e com Docker
- permitir futuras integrações com filas, push notifications e cloud

---

## Stack arquitetural

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT
- **Documentação:** Swagger
- **Testes:** Jest
- **Containerização:** Docker + Docker Compose
- **Agendamentos:** @nestjs/schedule / cron jobs

---

## Arquitetura em camadas

A aplicação segue uma estrutura em camadas:

```text
Client / Consumer
        ↓
Controllers
        ↓
Services
        ↓
Prisma ORM
        ↓
PostgreSQL
```

### 1. Controllers
Responsáveis por receber requisições HTTP, validar entrada, acionar os serviços e retornar respostas padronizadas.

### 2. Services
Responsáveis pela regra de negócio da aplicação. Toda lógica de criação, consulta, atualização, validação e processamento fica concentrada nessa camada.

### 3. Prisma ORM
Camada de acesso a dados. Responsável pela comunicação entre aplicação e banco PostgreSQL.

### 4. PostgreSQL
Responsável pela persistência dos dados da aplicação.

---

## Visão macro da arquitetura

```text
                 +----------------------+
                 |      Client/App      |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 |     NestJS API       |
                 +----------+-----------+
                            |
        +-------------------+-------------------+
        |                   |                   |
        v                   v                   v
+---------------+   +---------------+   +---------------+
|  Controllers  |   |   Swagger     |   |  Auth Guard   |
+-------+-------+   +---------------+   +---------------+
        |
        v
+-----------------------+
|       Services        |
+-----------+-----------+
            |
            +-------------------------------+
            |                               |
            v                               v
+-----------------------+        +-----------------------+
|   PrismaService       |        |   RemindersService    |
+-----------+-----------+        +-----------+-----------+
            |                                |
            v                                v
+-----------------------+        +-----------------------+
|     PostgreSQL        |        | NotificationService   |
+-----------------------+        +-----------+-----------+
                                             |
                                             v
                                    +-------------------+
                                    |    MailService    |
                                    +-------------------+
```

---

## Organização modular

A aplicação pode ser entendida como um conjunto de módulos de domínio.

### Módulos principais

#### Auth
Responsável por autenticação, login, geração e validação de token JWT.

#### Users
Responsável pela criação e gerenciamento de usuários.

#### Pets
Responsável pelo cadastro e manutenção dos pets vinculados a cada usuário.

#### Vaccines
Responsável pelo controle de vacinas, doses aplicadas e próximas aplicações.

#### Medications
Responsável pelo controle de medicamentos, horários e períodos de tratamento.

#### Notifications
Responsável por registrar o histórico de notificações enviadas e seus status.

#### Reminders
Responsável pelo processamento automático de lembretes via tarefas agendadas.

#### Mail
Responsável pelo envio de e-mails.

#### Prisma
Responsável pela abstração de acesso ao banco e conexão com o PostgreSQL.

#### Health
Responsável por validar se a aplicação está operacional.

---

## Fluxos principais

## 1. Fluxo de autenticação

```text
Usuário
  ↓
POST /auth/login
  ↓
Validação de credenciais
  ↓
Geração do JWT
  ↓
Retorno do access_token
```

Após autenticação, o token é utilizado para proteger rotas privadas.

---

## 2. Fluxo de cadastro de pet

```text
Usuário autenticado
  ↓
POST /pets
  ↓
Controller recebe payload
  ↓
Service valida regras
  ↓
Prisma persiste no banco
  ↓
Pet vinculado ao usuário
```

---

## 3. Fluxo de lembretes automáticos

```text
Cron job
  ↓
RemindersService
  ↓
Busca eventos pendentes
  ↓
Monta lembrete
  ↓
NotificationService registra envio
  ↓
MailService dispara e-mail
  ↓
Persistência do status (SENT / FAILED)
```

Esse fluxo é importante porque separa:
- processamento do lembrete
- registro da notificação
- envio do e-mail

Essa separação reduz acoplamento e facilita manutenção.

---

## Autenticação e segurança

A API utiliza **JWT** para autenticação.

### Estratégia adotada
- login gera token de acesso
- rotas protegidas exigem `Authorization: Bearer <token>`
- dados são filtrados por usuário autenticado
- cada usuário enxerga apenas seus próprios registros

### Benefícios
- isolamento de dados
- simplicidade de integração com front-end
- escalabilidade para futuras permissões e perfis de acesso

---

## Persistência e modelagem de dados

A persistência é feita em **PostgreSQL**, com acesso mediado pelo **Prisma ORM**.

### Papel do Prisma
- mapear entidades para tabelas
- facilitar consultas e mutações
- manter migrations versionadas
- gerar client tipado

### Entidades centrais esperadas no domínio
- User
- Pet
- Vaccine
- Medication
- Notification

A modelagem gira em torno do usuário autenticado como dono dos dados.

---

## Processamento assíncrono e agendado

A aplicação possui processamento agendado para lembretes usando cron jobs.

### Motivações
- automatizar verificação de vacinas e medicamentos
- evitar dependência de ação manual do usuário
- centralizar lógica temporal em um único serviço

### Possível evolução futura
Em cenários de maior volume, essa arquitetura pode evoluir para:
- filas com BullMQ
- processamento distribuído
- workers separados
- envio multi-canal (e-mail, push, SMS)

---

## Padronização de respostas

A API busca manter consistência nas respostas.

### Paginação
Endpoints de listagem podem retornar estrutura como:

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

### Benefícios
- previsibilidade para o front-end
- facilidade de consumo
- suporte natural a tabelas e listagens paginadas

---

## Observabilidade e documentação

### Swagger
A documentação da API é exposta via Swagger para facilitar testes e exploração dos endpoints.

### Healthcheck
O endpoint de healthcheck permite verificar se a aplicação está operacional.

### Logs
Os logs da aplicação ajudam no acompanhamento de erros e execução de processos automáticos, especialmente no fluxo de reminders.

---

## Execução com Docker

A aplicação suporta execução containerizada com dois serviços principais:

- **api**
- **db**

### Benefícios da abordagem
- padronização do ambiente
- facilidade de onboarding
- isolamento de dependências locais
- execução previsível entre diferentes máquinas

### Estrutura esperada
```text
Docker Compose
   ├── api (NestJS)
   └── db (PostgreSQL)
```

### Observação importante
O banco executado no Docker é independente do banco local da máquina.

---

## Decisões arquiteturais

### NestJS
Escolhido por oferecer:
- modularização forte
- injeção de dependência
- organização escalável
- boa integração com Swagger, guards e cron

### Prisma
Escolhido por oferecer:
- tipagem forte
- produtividade
- migrations organizadas
- integração simples com PostgreSQL

### PostgreSQL
Escolhido por:
- robustez
- confiabilidade
- aderência a aplicações transacionais

### Docker
Adotado para:
- simplificar setup local
- aproximar ambiente de desenvolvimento e deploy
- reduzir inconsistências entre máquinas

---

## Pontos fortes da arquitetura atual

- boa separação entre controller, service e persistência
- modularização clara por domínio
- autenticação bem definida
- base pronta para crescimento
- documentação e healthcheck já presentes
- ambiente containerizado
- suporte a testes automatizados

---

## Limitações atuais e oportunidades de evolução

### Limitações naturais da fase atual
- processamento de reminders ainda acoplado à própria API
- envio de notificações centralizado em e-mail
- ausência de fila para workloads maiores
- ausência de observabilidade mais robusta

### Evoluções recomendadas
- uso de filas para reminders e notificações
- criação de workers dedicados
- cache para consultas frequentes
- integração com provedores de push notification
- deploy cloud com pipeline CI/CD
- métricas e tracing
- controle de permissões por perfil

---

## Direcionamento futuro

A arquitetura atual é adequada para um projeto de pequeno e médio porte, com boa base para evolução gradual.

A tendência natural de crescimento pode seguir esta linha:

```text
Monólito modular
      ↓
Monólito mais robusto com filas
      ↓
Separação de workers
      ↓
Possível decomposição por contexto de negócio
```

Essa evolução permite amadurecer o sistema sem antecipar complexidade desnecessária.

---

## Conclusão

O **Pet Health API** foi estruturado como um **monólito modular**, com responsabilidades bem separadas e foco em clareza, manutenção e escalabilidade progressiva.

A combinação de **NestJS + Prisma + PostgreSQL + Docker** oferece uma base sólida para:

- manter o projeto organizado
- facilitar onboarding
- sustentar crescimento do domínio
- preparar a aplicação para futuras evoluções técnicas
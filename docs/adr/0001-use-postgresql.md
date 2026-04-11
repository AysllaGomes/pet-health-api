# ADR 0001: Uso de PostgreSQL como banco de dados

## Status

Aceito

## Contexto

A aplicação Pet Health API necessita armazenar informações relacionadas a:

* usuários
* pets
* vacinas e tratamentos
* notificações

Essas entidades possuem relações bem definidas, como:

* um usuário possui vários pets
* um pet possui várias vacinas
* uma vacina gera notificações

Inicialmente foi considerada a utilização de banco NoSQL (MongoDB), devido à familiaridade prévia.

## Decisão

Foi adotado o **PostgreSQL** como banco de dados relacional principal.

## Justificativa

* Forte suporte a relacionamentos entre entidades
* Integridade referencial (chaves estrangeiras)
* Estrutura adequada para crescimento do domínio
* Facilidade de consultas complexas futuras
* Melhor organização para regras de negócio estruturadas
* Integração eficiente com Prisma ORM

## Consequências

### Positivas

* Dados mais consistentes
* Estrutura previsível
* Melhor suporte a evolução do sistema

### Negativas

* Maior rigidez na modelagem inicial
* Necessidade de migrations para alterações

## Alternativas consideradas

### MongoDB

* Prós: flexível, rápido para começar
* Contras: dificuldade com relações complexas

## Decisão final

PostgreSQL atende melhor às necessidades atuais e futuras do sistema.

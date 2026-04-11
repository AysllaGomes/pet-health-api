# ADR 0002: Uso do Prisma como ORM

## Status

Aceito

## Contexto

A aplicação precisa de uma camada de acesso ao banco que seja:

* produtiva
* segura
* bem integrada com TypeScript
* fácil de manter

## Decisão

Foi adotado o **Prisma ORM**.

## Justificativa

* Tipagem forte com TypeScript
* Autocomplete e segurança em queries
* Migrations integradas
* Facilidade de leitura e manutenção
* Boa integração com NestJS

## Consequências

### Positivas

* Redução de erros em queries
* Alta produtividade
* Código mais limpo

### Negativas

* Dependência de uma ferramenta adicional
* Curva de aprendizado inicial

## Alternativas consideradas

### TypeORM

* Mais flexível
* Mais verboso

### Sequelize

* Menos tipado
* Menos moderno

## Decisão final

Prisma oferece melhor equilíbrio entre produtividade e segurança.

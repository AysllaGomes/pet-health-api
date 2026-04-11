# ADR 0005: Uso de categoria em Vaccine para regras de lembrete

## Status

Aceito

## Contexto

Inicialmente, as regras de lembrete eram baseadas no nome da vacina (ex: "Antipulgas", "Vermífugo").

Isso gerava problemas como:

* dependência de texto
* risco de erro humano
* dificuldade de manutenção

## Decisão

Foi criado um campo `category` no model `Vaccine`.

Valores:

* VACCINE
* ANTIPARASITIC
* DEWORMER

## Justificativa

* Separação clara de regras de negócio
* Evita dependência de string
* Facilita manutenção e evolução
* Permite regras específicas por categoria

## Consequências

### Positivas

* Código mais limpo
* Regras mais previsíveis
* Menor risco de erro

### Negativas

* Necessidade de migration no banco
* Atualização de DTOs e services

## Alternativas consideradas

### Uso de nome (string)

* Simples
* Não escalável

## Decisão final

Uso de categoria torna o sistema mais robusto e sustentável.

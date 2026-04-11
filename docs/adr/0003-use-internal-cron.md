# ADR 0003: Uso de cron interno com @nestjs/schedule

## Status

Aceito

## Contexto

A aplicação precisa executar tarefas automáticas para envio de lembretes.

Existem duas opções principais:

* scheduler interno na aplicação
* scheduler externo (cloud, cron job, etc.)

## Decisão

Foi adotado o uso de **@nestjs/schedule** para execução de cron jobs internos.

## Justificativa

* Implementação simples
* Integração direta com o código da aplicação
* Ideal para MVP
* Não requer infraestrutura adicional

## Consequências

### Positivas

* Desenvolvimento rápido
* Fácil manutenção

### Negativas

* Dependência da aplicação estar em execução
* Não escalável para alta carga

## Alternativas consideradas

### Cron externo

* Mais robusto
* Mais complexo

### Filas com workers

* Mais escalável
* Overkill para MVP

## Decisão final

Scheduler interno atende bem ao estágio atual do projeto.

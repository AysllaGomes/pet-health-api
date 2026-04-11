# ADR 0004: Uso de SMTP (Gmail) para envio de e-mails

## Status

Aceito

## Contexto

A aplicação precisa enviar notificações por e-mail.

Opções disponíveis:

* SMTP simples
* APIs de e-mail (SendGrid, Resend, etc.)

## Decisão

Foi adotado **SMTP com Gmail via Nodemailer**.

## Justificativa

* Simples de configurar
* Não requer conta paga
* Ideal para desenvolvimento e testes

## Consequências

### Positivas

* Implementação rápida
* Baixo custo

### Negativas

* Limitações de envio
* Não recomendado para produção
* Dependência de App Password

## Alternativas consideradas

### SendGrid / Resend

* Mais robustos
* Melhor entrega
* Necessitam configuração adicional

## Decisão final

SMTP com Gmail é suficiente para o estágio atual do projeto.

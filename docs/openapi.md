# Pet Health API - OpenAPI / Swagger

## Visão geral

A aplicação **Pet Health API** disponibiliza documentação interativa da API usando **Swagger UI**, gerada a partir da configuração com `@nestjs/swagger`.

Essa documentação permite:

* visualizar endpoints disponíveis
* consultar payloads de entrada
* ver parâmetros e respostas esperadas
* testar requisições diretamente pela interface

---

## Acesso

Com a aplicação em execução, a documentação fica disponível em:

```text
http://localhost:3000/docs
```

---

## Tecnologias utilizadas

* `@nestjs/swagger`
* `SwaggerModule`
* `DocumentBuilder`

---

## O que está documentado

Atualmente, a documentação cobre os módulos:

* `users`
* `pets`
* `vaccines`

Cada endpoint possui:

* resumo da operação
* parâmetros
* body de entrada
* responses principais
* models dos DTOs

---

## Estrutura da configuração

A configuração do Swagger foi adicionada no arquivo `main.ts`, utilizando:

* `DocumentBuilder` para definir metadados da API
* `SwaggerModule.createDocument()` para gerar o documento OpenAPI
* `SwaggerModule.setup()` para expor a interface Swagger UI

---

## DTOs documentados

Os DTOs foram anotados com decorators como:

* `@ApiProperty()`
* `@ApiPropertyOptional()`

Esses decorators garantem que os campos sejam exibidos corretamente na documentação.

---

## Controllers documentados

Os controllers utilizam decorators como:

* `@ApiTags()`
* `@ApiOperation()`
* `@ApiBody()`
* `@ApiParam()`
* `@ApiResponse()`

Esses decorators ajudam a descrever cada rota de forma clara.

---

## Benefícios

A documentação OpenAPI traz os seguintes ganhos:

* melhora a experiência de desenvolvimento
* facilita testes manuais
* deixa o contrato da API visível
* ajuda na integração futura com frontend ou apps mobile
* reduz dependência de documentação manual

---

## Exemplo de uso

### Criar usuário

**POST** `/users`

```json
{
  "name": "Nome",
  "email": "user@email.com",
  "password": "123456"
}
```

### Criar pet

**POST** `/pets`

```json
{
  "userId": "USER_ID",
  "name": "Thor",
  "species": "dog",
  "breed": "Golden Retriever",
  "birthDate": "2020-05-10",
  "weight": 30
}
```

### Criar vacina

**POST** `/vaccines`

```json
{
  "petId": "PET_ID",
  "name": "Antipulgas",
  "category": "ANTIPARASITIC",
  "applicationDate": "2026-04-11",
  "nextDoseDate": "2026-04-16",
  "reminderDaysBefore": 5
}
```

---

## Observações

* a documentação é gerada automaticamente a partir do código
* qualquer mudança em DTOs e controllers pode refletir no Swagger
* o ideal é manter os decorators atualizados conforme a API evolui

---

## Evoluções futuras

No futuro, a documentação pode ser expandida com:

* autenticação JWT no Swagger
* schemas de resposta padronizados
* examples mais completos
* documentação dos módulos de medications e appointments

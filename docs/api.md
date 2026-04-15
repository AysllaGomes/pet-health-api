# API

## Base URL

http://localhost:3000

## Autenticação

```bash
Authorization: Bearer <token>
```

## Padrão de resposta
### Paginação

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10
  }
}
```
### Módulos
- Auth 
- Users 
- Pets 
- Vaccines 
- Medications 
- Notifications

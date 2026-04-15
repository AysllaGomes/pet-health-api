# 🐳 Docker

## Visão geral

O projeto utiliza Docker para padronizar o ambiente de execução.

## Serviços

- api → NestJS
- db → PostgreSQL

## Subindo ambiente

```bash
docker compose up --build
```

## Parando

```bash
docker compose down
```

## Resetando banco

```bash
docker compose down -v
```

## Logs

```bash
docker compose logs -f
```

## Observações
- O banco do Docker é independente do local
- Usa volume `postgres_data`

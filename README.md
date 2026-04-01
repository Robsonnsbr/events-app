# Events App

Aplicacao fullstack para gerenciamento de eventos e participantes.

## Stack

- Backend: Node.js, TypeScript, Express, Prisma 7, PostgreSQL 15
- Frontend: Next.js, React, TypeScript, Axios, Tailwind CSS
- Infra: Docker, Docker Compose

## Funcionalidades

- Cadastro e listagem de eventos
- Cadastro de participantes com nome, email e telefone
- Inscricao de participantes em eventos
- Detalhe do evento com lista de inscritos
- Migrations Prisma para evolucao do banco

## Estrutura

```text
.
├── backend
│   ├── prisma
│   └── src
├── frontend
│   ├── app
│   ├── components
│   └── lib
├── docker-compose.yml
└── docker-compose.prod.yml
```

## Variaveis de ambiente

Copie `.env.example` para `.env` na raiz:

```bash
cp .env.example .env
```

O `makefile` tambem valida a existencia de `backend/.env`, entao mantenha esse arquivo presente:

```bash
cp backend/.env.example backend/.env
```

Valores usados por padrao env raiz:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=events_db
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/events_db
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Valores usados por padrao env backend:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/events_db"
```

## Rodando em desenvolvimento

Aviso: É necessário instalar o make para os próximos comandos.

```bash
sudo apt install make
```

Suba o ambiente:

```bash
make dev
```

Servicos:

- Frontend: http://localhost:3000
- Backend: http://localhost:3333

Para rebuild do ambiente de desenvolvimento:

```bash
make dev-rebuild
```

Para rebuild completo, limpando imagens e volumes:

```bash
make dev-hardbuild
```

Para parar:

```bash
make dev-down
```

## Rodando em producao local

Suba o stack de producao:

```bash
make prod
```

Para rebuild do ambiente de producao:

```bash
make prod-rebuild
```

Para rebuild completo, limpando imagens e volumes:

```bash
make prod-hardbuild
```

Para parar:

```bash
make prod-down
```

## Logs

Logs do backend em producao:

```bash
make logs-backend
```

Logs do frontend em producao:

```bash
make logs-frontend
```

## Testes automatizados

Rodar toda a suite:

```bash
make test
```

Rodar apenas backend:

```bash
make test-backend
```

Rodar apenas frontend:

```bash
make test-frontend
```

## Endpoints principais

- `GET /events`
- `POST /events`
- `GET /events/:eventId`
- `GET /events/:eventId/participants`
- `POST /events/:eventId/participants`
- `GET /participants`
- `POST /participants`

## Validacao usada durante a implementacao

- `npm run build` no backend
- `npm run prisma:validate` no backend
- `npm test` no backend
- `npm run lint` no frontend
- `npm run build` no frontend
- `npm test` no frontend
- Testes manuais via `curl` nos endpoints do backend


<!-- Título -->
<h3 align="center">Visão Geral do Events App</h3>

<!-- Imagem do events-app -->
<p align="center">
  <img src="https://github.com/user-attachments/assets/seu-events-app.png" width="60%" />
</p>

<!-- Duas imagens lado a lado -->
<p float="left">
  <img src="https://github.com/user-attachments/assets/07abe7d4-414d-45f2-a43a-1d7b33bbe6eb" width="45%" />
  <img src="https://github.com/user-attachments/assets/f5ba5a28-5ff5-47f0-ad82-c762f5fa7961" width="45%" />
</p>

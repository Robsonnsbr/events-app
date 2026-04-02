# Events App

Aplicação fullstack para gerenciamento de eventos e participantes.

## Clone do Repositório

Clone o projeto para sua máquina:

```bash
git clone git@github.com:Robsonnsbr/events-app.git
cd events-app
```

## Avisos e Pré-requisitos

Antes de qualquer configuração, certifique-se de ter instalado:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/)

```bash
# No Ubuntu/Debian
sudo apt install make docker docker-compose
```

## Stack

- Backend: Node.js, TypeScript, Express, Prisma 7, PostgreSQL 15
- Frontend: Next.js, React, TypeScript, Axios, Tailwind CSS
- Infra: Docker, Docker Compose

## Funcionalidades

- Cadastro e listagem de eventos
- Cadastro de participantes com nome, email e telefone
- Inscrição de participantes em eventos
- Detalhe do evento com lista de inscritos
- Migrations Prisma para evolução do banco

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

## Variáveis de ambiente

Copie `.env.example` para `.env` na raiz:

```bash
cp .env.example .env
```

O `makefile` também valida a existência de `backend/.env`, então mantenha esse arquivo presente:

```bash
cp backend/.env.example backend/.env
```

Valores usados por padrão no `.env` raiz:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=events_db
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/events_db
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Valores usados por padrão no `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/events_db"
```

## Rodando em desenvolvimento

Suba o ambiente:

```bash
make dev
```

Serviços:

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

## Rodando em produção local

Suba o stack de produção:

```bash
make prod
```

Para rebuild do ambiente de produção:

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

Logs do backend em produção:

```bash
make logs-backend
```

Logs do frontend em produção:

```bash
make logs-frontend
```

## Testes automatizados

Rodar toda a suíte:

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

## Validação usada durante a implementação

- `npm run build` no backend
- `npm run prisma:validate` no backend
- `npm test` no backend
- `npm run lint` no frontend
- `npm run build` no frontend
- `npm test` no frontend
- Testes manuais via `curl` nos endpoints do backend

<h3 align="center">Visão Geral do Events App</h3>
<p align="center">
  <img src="https://github.com/user-attachments/assets/seu-events-app.png" width="60%" />
</p>

<!-- Duas imagens lado a lado -->
<p float="left">
  <img src="https://github.com/user-attachments/assets/07abe7d4-414d-45f2-a43a-1d7b33bbe6eb" width="45%" />
  <img src="https://github.com/user-attachments/assets/f5ba5a28-5ff5-47f0-ad82-c762f5fa7961" width="45%" />
</p>


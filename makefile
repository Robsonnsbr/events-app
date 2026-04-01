# Makefile para events-app

# ========================================
# Função para validar arquivos essenciais
# ========================================
define check_env
	@if [ ! -f .env ]; then \
		echo "ERRO: arquivo .env não encontrado na raiz"; \
		exit 1; \
	fi
	@if [ ! -f backend/.env ]; then \
		echo "ERRO: arquivo .env não encontrado em backend"; \
		exit 1; \
	fi
endef

# ========================================
# Ambiente de Desenvolvimento
# ========================================

# Subir dev normalmente (usa cache)
dev:
	$(check_env)
	docker compose up -d

# Rebuild dev (derruba containers, reconstrói imagens sem limpar volumes)
dev-rebuild:
	$(check_env)
	docker compose down
	docker compose build --no-cache
	docker compose up -d --force-recreate

# Hard rebuild dev (derruba tudo: containers, volumes, imagens)
dev-hardbuild:
	$(check_env)
	docker compose down --rmi all --volumes --remove-orphans
	docker compose build --no-cache
	docker compose up -d --force-recreate

# Derrubar dev
dev-down:
	docker compose down

# ========================================
# Ambiente de Produção
# ========================================

# Subir produção normalmente (usa cache)
prod:
	$(check_env)
	docker compose -p events-app-prod -f docker-compose.prod.yml up -d

# Rebuild produção (derruba containers, reconstrói imagens sem limpar volumes)
prod-rebuild:
	$(check_env)
	docker compose -p events-app-prod -f docker-compose.prod.yml down
	docker compose -p events-app-prod -f docker-compose.prod.yml build --no-cache
	docker compose -p events-app-prod -f docker-compose.prod.yml up -d --force-recreate

# Hard rebuild produção (derruba tudo: containers, volumes, imagens)
prod-hardbuild:
	$(check_env)
	docker compose -p events-app-prod -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
	docker compose -p events-app-prod -f docker-compose.prod.yml build --no-cache
	docker compose -p events-app-prod -f docker-compose.prod.yml up -d --force-recreate

# Derrubar produção
prod-down:
	docker compose -p events-app-prod -f docker-compose.prod.yml down

# ========================================
# Logs
# ========================================
logs-backend:
	docker compose -p events-app-prod -f docker-compose.prod.yml logs -f backend

logs-frontend:
	docker compose -p events-app-prod -f docker-compose.prod.yml logs -f frontend
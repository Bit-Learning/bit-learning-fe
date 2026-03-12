DOCKER_APP   = docker-compose-local-dev-latest.yml
CONTAINER_WEB  = bitlearning-web-local-dev
CONTAINER_ADMIN = bitlearning-admin-local-dev
NETWORK_NAME = bitlearning-network

.PHONY: app-up up down rebuild-web rebuild-admin logs-web logs-admin ps

app-up:
	docker compose -f $(DOCKER_APP) up -d --remove-orphans

up:
	@docker network create $(NETWORK_NAME) || true
	@echo "Waiting for network to be ready..."
	@sleep 5
	@make app-up

down:
	docker compose -f $(DOCKER_APP) down

rebuild-web:
	docker compose -f $(DOCKER_APP) up -d $(CONTAINER_WEB) --build --no-deps

rebuild-admin:
	docker compose -f $(DOCKER_APP) up -d $(CONTAINER_ADMIN) --build --no-deps

logs-web:
	docker compose -f $(DOCKER_APP) logs -f $(CONTAINER_WEB)

logs-admin:
	docker compose -f $(DOCKER_APP) logs -f $(CONTAINER_ADMIN)

ps:
	docker compose -f $(DOCKER_APP) ps

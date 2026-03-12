DOCKER_LOCAL_DEV = docker-compose-local-dev-latest.yml
DOCKER_LOCAL_PROD = docker-compose-local-prod-latest.yml

CONTAINER_WEB_DEV = bitlearning-web-local-dev
CONTAINER_ADMIN_DEV = bitlearning-admin-local-dev

CONTAINER_WEB_PROD = bitlearning-web-local-prod
CONTAINER_ADMIN_PROD = bitlearning-admin-local-prod

NETWORK_NAME = bitlearning-network


.PHONY: \
	up up-prod down down-prod \
	rebuild-web rebuild-admin rebuild-web-prod rebuild-admin-prod \
	restart-web restart-admin restart-web-prod restart-admin-prod \
	logs-web logs-admin logs-web-prod logs-admin-prod \
	ps ps-prod clean hard-clean


# ========================
# INTERNAL MACROS
# ========================

define compose-up
	docker compose -f $(1) up -d --remove-orphans
endef

define compose-down
	docker compose -f $(1) down
endef

define compose-rebuild
	docker compose -f $(1) rm -sf $(2)
	docker compose -f $(1) build --no-cache $(2)
	docker compose -f $(1) up -d --no-deps $(2)
endef

define compose-restart
	docker compose -f $(1) restart $(2)
endef

define compose-logs
	docker compose -f $(1) logs -f $(2)
endef

define compose-ps
	docker compose -f $(1) ps
endef


# ========================
# START SERVICES
# ========================

up:
	@docker network create $(NETWORK_NAME) || true
	@echo "Waiting for network..."
	@sleep 2
	$(call compose-up,$(DOCKER_LOCAL_DEV))

up-prod:
	@docker network create $(NETWORK_NAME) || true
	@echo "Waiting for network..."
	@sleep 2
	$(call compose-up,$(DOCKER_LOCAL_PROD))


# ========================
# STOP SERVICES
# ========================

down:
	$(call compose-down,$(DOCKER_LOCAL_DEV))

down-prod:
	$(call compose-down,$(DOCKER_LOCAL_PROD))


# ========================
# REBUILD (NO CACHE)
# ========================

rebuild-web:
	$(call compose-rebuild,$(DOCKER_LOCAL_DEV),$(CONTAINER_WEB_DEV))

rebuild-admin:
	$(call compose-rebuild,$(DOCKER_LOCAL_DEV),$(CONTAINER_ADMIN_DEV))

rebuild-web-prod:
	$(call compose-rebuild,$(DOCKER_LOCAL_PROD),$(CONTAINER_WEB_PROD))

rebuild-admin-prod:
	$(call compose-rebuild,$(DOCKER_LOCAL_PROD),$(CONTAINER_ADMIN_PROD))


# ========================
# RESTART
# ========================

restart-web:
	$(call compose-restart,$(DOCKER_LOCAL_DEV),$(CONTAINER_WEB_DEV))

restart-admin:
	$(call compose-restart,$(DOCKER_LOCAL_DEV),$(CONTAINER_ADMIN_DEV))

restart-web-prod:
	$(call compose-restart,$(DOCKER_LOCAL_PROD),$(CONTAINER_WEB_PROD))

restart-admin-prod:
	$(call compose-restart,$(DOCKER_LOCAL_PROD),$(CONTAINER_ADMIN_PROD))


# ========================
# LOGS
# ========================

logs-web:
	$(call compose-logs,$(DOCKER_LOCAL_DEV),$(CONTAINER_WEB_DEV))

logs-admin:
	$(call compose-logs,$(DOCKER_LOCAL_DEV),$(CONTAINER_ADMIN_DEV))

logs-web-prod:
	$(call compose-logs,$(DOCKER_LOCAL_PROD),$(CONTAINER_WEB_PROD))

logs-admin-prod:
	$(call compose-logs,$(DOCKER_LOCAL_PROD),$(CONTAINER_ADMIN_PROD))


# ========================
# STATUS
# ========================

ps:
	$(call compose-ps,$(DOCKER_LOCAL_DEV))

ps-prod:
	$(call compose-ps,$(DOCKER_LOCAL_PROD))


# ========================
# CLEAN DOCKER
# ========================

clean:
	docker builder prune -f

hard-clean:
	docker system prune -af
	docker volume prune -f

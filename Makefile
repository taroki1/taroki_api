# Переменные
BINARY_NAME=main
APP_CMD_PATH=cmd/main.go
PM2_APP_NAME="Unreal AI Bot"
CONFIG_FILENAME="cfg.yaml"

# Создание файла конфигурации
init:
	@if [ -f $(CONFIG_FILENAME) ]; then \
		read -p "File '$(CONFIG_FILENAME)' already exists. Do you want to overwrite it? (yes/no): " answer; \
		if [ "$$answer" != "yes" ]; then \
			echo "Aborting."; \
			exit 1; \
		fi; \
	fi
	@echo "TMA_URL: ''" >> $(CONFIG_FILENAME)
	@echo "BOT_TOKEN: ''" >> $(CONFIG_FILENAME)
	@echo "CHANNEL_ID: -1111111111111" >> $(CONFIG_FILENAME)
	@echo "ADMIN_USER_ID: 111111111" >> $(CONFIG_FILENAME)
	@echo "" >> $(CONFIG_FILENAME)

# Запуск приложения в режиме разработки
dev:
	go run $(APP_CMD_PATH)

# Обновление приложения из репозитория, сборка и перезапуск сервера
update: git-pull build restart-app-server

# Скачивание обновлений из репозитория
git-pull:
	git pull

# Сборка приложения
build:
	CGO_ENABLED=0 go build -o $(BINARY_NAME) -ldflags "-w -s" $(APP_CMD_PATH)

# Перезапуск приложения с помощью pm2 и обновление переменных среды
restart-app-server:
	pm2 restart $(PM2_APP_NAME) --update-env

.PHONY: dev update git-pull build restart-app-server init
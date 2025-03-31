# Используем Node.js 20 slim образ
FROM node:20-slim

# Создаем непривилегированного пользователя
RUN useradd -m -r -s /bin/bash duolingo

# Создаем директорию для приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Создаем директорию для логов и настраиваем права
RUN mkdir -p /app/logs && \
    chown -R duolingo:duolingo /app && \
    chmod -R 755 /app

# Принудительно удаляем results.json, если это директория
RUN rm -rf /app/results.json

# Переключаемся на непривилегированного пользователя
USER duolingo

# Запускаем основной скрипт Node.js
CMD ["node", "duolingo.js"]

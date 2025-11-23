# Используем Node.js 20 slim образ
FROM node:20-slim

# Создаем непривилегированного пользователя с фиксированным UID 1000 (совпадает с node)
# Удаляем существующего пользователя node и создаем duolingo с UID 1000
RUN userdel -r node && useradd -u 1000 -m -r -s /bin/bash duolingo

# Создаем директорию для приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Создаем директорию для логов и настраиваем права
RUN mkdir -p /app/logs &&     chown -R duolingo:duolingo /app &&     chmod -R 755 /app

# Принудительно удаляем results.json, если это директория
RUN rm -rf /app/results.json

# Переключаемся на непривилегированного пользователя
USER duolingo

# Запускаем основной скрипт Node.js
CMD ["node", "duolingo.js"]

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0"]

EXPOSE 8080

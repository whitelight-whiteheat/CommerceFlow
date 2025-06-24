FROM node:18

WORKDIR /usr/src/app

# Install libssl1.1 for Prisma
RUN apt-get update && apt-get install -y libssl1.1 || apt-get install -y libssl-dev

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"] 
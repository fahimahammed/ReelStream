FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn global add prisma

ENV NODE_ENV=production
ENV PORT=5001

RUN prisma generate

EXPOSE 3000

CMD ["yarn", "dev"]

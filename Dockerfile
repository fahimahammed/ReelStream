FROM node:18-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn global add prisma

RUN prisma generate

EXPOSE 3000

CMD ["sh", "-c", "yarn migrate && yarn build && yarn start"]

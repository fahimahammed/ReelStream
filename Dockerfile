FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn global add prisma

RUN prisma generate

RUN yarn add ffmpeg-static ffprobe-static

EXPOSE 3000

CMD ["sh", "-c", "yarn migrate && yarn build && yarn start"]

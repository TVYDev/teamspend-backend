FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm dlx prisma generate

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "run", "start:migrate:prod"]
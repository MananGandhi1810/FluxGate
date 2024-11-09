FROM node:22-alpine AS builder
ARG repoUrl
WORKDIR /app
RUN apk add git
RUN git clone ${repoUrl}
RUN npm ci --silent && npm cache clean --force

FROM node:22-alpine AS production
WORKDIR /app
ARG repoUrl
COPY --from=builder /app/node_modules ./node_modules
RUN apk add git
RUN git clone ${repoUrl}
EXPOSE 3000
CMD ["npm", "start"]
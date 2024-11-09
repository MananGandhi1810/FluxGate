FROM node:22-alpine AS builder
WORKDIR /app
ARG repoUrl
ARG branch
ARG commitHash
RUN apk add git
RUN git clone -b ${branch} ${repoUrl} .
RUN git reset --hard ${commitHash}
RUN npm ci --silent && npm cache clean --force

FROM node:22-alpine AS production
WORKDIR /app
ARG repoUrl
ARG branch
ARG commitHash
RUN apk add git
RUN git clone -b ${branch} ${repoUrl} .
RUN git reset --hard ${commitHash}
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
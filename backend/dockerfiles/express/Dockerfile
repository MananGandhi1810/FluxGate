FROM node:22-slim AS builder
WORKDIR /app
ARG repoUrl
ARG branch
ARG commitHash
ARG dir
RUN apt update && apt install -y git
RUN git clone -b ${branch}/${repoUrl} .
RUN git reset --hard ${commitHash}
WORKDIR /app/${dir}
RUN npm ci --silent && npm cache clean --force

FROM node:22-slim AS production
WORKDIR /app
ARG repoUrl
ARG branch
ARG commitHash
ARG dir
RUN apt update && apt install -y git
RUN git clone -b ${branch}/${repoUrl} .
RUN git reset --hard ${commitHash}
WORKDIR /app/${dir}
COPY --from=builder /app/${dir}/node_modules ./node_modules
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
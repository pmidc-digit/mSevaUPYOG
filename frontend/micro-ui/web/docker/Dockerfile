FROM node:22-alpine AS build

RUN apk update && apk upgrade
RUN apk add --no-cache git

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY . .

# Handle both build contexts: when built from web/ dir or parent micro-ui/ dir
RUN if [ -d "web" ]; then cd web; fi && \
    if [ -f "envs.js" ]; then node envs.js; else echo "envs.js not found"; fi && \
    if [ ! -f "install-deps.sh" ]; then echo "ERROR: install-deps.sh not found in $(pwd)"; exit 1; fi && \
    chmod +x install-deps.sh && \
    sed -i 's/\r$//' install-deps.sh && \
    ./install-deps.sh && \
    yarn install && \
    yarn build


FROM nginx:mainline-alpine

RUN apk add --no-cache font-noto font-noto-cjk

RUN echo '{"resolutions": {"node-releases": "2.0.44"}}' > package.json

ENV WORK_DIR=/var/web/digit-ui

RUN mkdir -p ${WORK_DIR}

COPY --from=build /app/build ${WORK_DIR}/
COPY --from=build /app/docker/nginx.conf /etc/nginx/conf.d/default.conf

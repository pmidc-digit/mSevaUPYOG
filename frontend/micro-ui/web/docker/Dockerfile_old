FROM node:22-alpine AS build

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN apk add --no-cache git

COPY . .

RUN cd web && \
    if [ -f "envs.js" ]; then \
        node envs.js; \
    else \
        echo "envs.js not found"; \
    fi && \
    chmod +x install-deps.sh && \
    sed -i 's/\r$//' install-deps.sh && \
    ./install-deps.sh && \
    yarn build


FROM nginx:mainline-alpine

ENV WORK_DIR=/var/web/digit-ui

RUN mkdir -p ${WORK_DIR}

COPY --from=build /app/web/build ${WORK_DIR}/
COPY --from=build /app/web/docker/nginx.conf /etc/nginx/conf.d/default.conf

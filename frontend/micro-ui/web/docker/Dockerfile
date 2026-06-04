FROM node:22-alpine AS build

RUN apk update && apk upgrade
RUN apk add --no-cache git

ARG WORK_DIR
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY ${WORK_DIR} .

RUN node envs.js \
    && chmod +x install-deps.sh \
    && sed -i 's/\r$//' install-deps.sh \
    && ./install-deps.sh \
    && yarn install \
    && yarn build


FROM nginx:mainline-alpine

RUN apk add --no-cache font-noto font-noto-cjk

RUN echo '{"resolutions": {"node-releases": "2.0.44"}}' > package.json

ENV WORK_DIR=/var/web/digit-ui

RUN mkdir -p ${WORK_DIR}

COPY --from=build /app/build ${WORK_DIR}/
COPY --from=build /app/docker/nginx.conf /etc/nginx/conf.d/default.conf

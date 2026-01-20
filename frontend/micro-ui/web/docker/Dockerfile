FROM egovio/alpine-node-builder-14:yarn AS build
RUN apk update && apk upgrade
RUN apk add --no-cache git>2.30.0
RUN yarn add @mseva/digit-ui-libraries@1.1.59
RUN yarn add @mseva/digit-ui-module-bills@1.0.8
RUN yarn add @mseva/digit-ui-module-fsm@1.0.6
RUN yarn add @mseva/digit-ui-module-dss@1.0.6
RUN yarn add @mseva/digit-ui-module-mcollect@1.0.15
RUN yarn add @mseva/digit-ui-module-pgr@1.0.22
RUN yarn add @mseva/digit-ui-module-noc@1.0.51
RUN yarn add @mseva/digit-ui-module-engagement@1.1.32
RUN yarn add @mseva/digit-ui-module-hrms@1.0.13
RUN yarn add @mseva/digit-ui-module-core@1.0.65
RUN yarn add @mseva/digit-ui-module-common@1.1.80
RUN yarn add @mseva/digit-ui-module-ws@1.0.15
RUN yarn add @mseva/digit-ui-module-commonpt@1.0.6
RUN yarn add @mseva/digit-ui-module-ptr@1.2.5
RUN yarn add @mseva/digit-ui-module-swach@1.0.49
RUN yarn add @mseva/digit-ui-module-pt@1.0.39
RUN yarn add @mseva/digit-ui-module-tl@1.0.28
RUN yarn add @mseva/digit-ui-module-obps@1.1.64
RUN yarn add @mseva/digit-ui-module-sv@1.1.42
RUN yarn add @mseva/upyog-ui-module-ads@1.1.76
RUN yarn add @mseva/upyog-ui-module-chb@1.1.82
RUN yarn add @mseva/upyog-ui-module-asset@1.1.36
RUN yarn add @mseva/upyog-ui-module-pgrai@1.1.26
RUN yarn add @mseva/digit-ui-module-challangeneration@1.0.28
RUN yarn add @mseva/digit-ui-module-garbagecollection@1.0.33
RUN yarn add @mseva/digit-ui-module-rentandlease@1.0.40
RUN yarn add @mseva/digit-ui-module-ndc@1.0.63
ARG WORK_DIR
WORKDIR /app
# ENV NODE_OPTIONS "--max-old-space-size=8192" 12288 4192
ENV  NODE_OPTIONS "--max_old_space_size=12288 react-scripts build"
ENV GENERATE_SOURCEMAP "true"

COPY ${WORK_DIR} .
RUN ls -lah

#RUN node web/envs.js
RUN cd web/ \
    && node envs.js \
    && node -e 'console.log(v8.getHeapStatistics().heap_size_limit/(12288*12288))' \
    &&  ./install-deps.sh \
    && yarn install \
    && yarn build 


FROM nginx:mainline-alpine
#FROM ghcr.io/egovernments/nginx:mainline-alpine
ENV WORK_DIR=/var/web/digit-ui

RUN mkdir -p ${WORK_DIR}

COPY --from=build /app/web/build ${WORK_DIR}/
COPY --from=build /app/web/docker/nginx.conf /etc/nginx/conf.d/default.conf

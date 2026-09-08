FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

ARG WORK_DIR
WORKDIR /app

COPY ${WORK_DIR}/pom.xml ./pom.xml
COPY ${WORK_DIR}/start.sh ./start.sh
COPY ${WORK_DIR}/src ./src

RUN java -version && mvn -version

RUN mvn -B -f /app/pom.xml \
    package \
    -Dmaven.test.skip=true \
    -DskipTests

FROM eclipse-temurin:21-jre-alpine

RUN apk update && \
    apk add --no-cache ca-certificates openssl && \
    update-ca-certificates

WORKDIR /opt/egov

COPY --from=build /app/target/*.jar /opt/egov/
COPY --from=build /app/start.sh /opt/egov/start.sh

COPY --from=build \
    /app/src/main/resources/smsgwsmsgovin.cer \
    /opt/egov/smsgwsmsgovin.cer

RUN keytool -importcert \
    -alias smsgwsmsgovin \
    -trustcacerts \
    -noprompt \
    -storepass changeit \
    -keystore "${JAVA_HOME}/lib/security/cacerts" \
    -file /opt/egov/smsgwsmsgovin.cer

RUN chmod +x /opt/egov/start.sh

CMD ["/opt/egov/start.sh"]

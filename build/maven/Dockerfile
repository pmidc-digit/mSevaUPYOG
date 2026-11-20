FROM upyogio/alpine-maven-builder-jdk-8:1-master-NA-6036091e AS build

USER root

ARG WORK_DIR
WORKDIR /app

# Copy emSign Root CA certificate
COPY certs/emSignRootCAG1.crt /tmp/emSignRootCAG1.crt

# Import certificate into IBM Java 8 truststore
RUN /opt/ibm/java/bin/keytool -importcert \
    -trustcacerts \
    -noprompt \
    -alias emsign-root-ca-g1 \
    -file /tmp/emSignRootCAG1.crt \
    -keystore /opt/ibm/java/jre/lib/security/cacerts \
    -storepass changeit \
    && /opt/ibm/java/bin/keytool -list \
    -keystore /opt/ibm/java/jre/lib/security/cacerts \
    -storepass changeit \
    -alias emsign-root-ca-g1 \
    && rm -f /tmp/emSignRootCAG1.crt

COPY ${WORK_DIR}/pom.xml ./pom.xml
COPY build/maven/start.sh ./start.sh
COPY ${WORK_DIR}/src ./src

RUN mvn -B -f /app/pom.xml package \
    -Dmaven.test.skip=true \
    -DskipTests

FROM upyogio/8-openjdk-alpine

RUN apk update && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates

WORKDIR /opt/egov

COPY --from=build /app/target/*.jar /app/start.sh /opt/egov/

RUN chmod +x /opt/egov/start.sh

CMD ["/opt/egov/start.sh"]

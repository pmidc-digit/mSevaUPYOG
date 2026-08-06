# =========================
# Build Stage
# =========================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

ARG WORK_DIR

WORKDIR /app

# Copy pom first
COPY ${WORK_DIR}/pom.xml ./pom.xml

# Copy startup script
COPY build/maven/start.sh ./start.sh

# Copy source code
COPY ${WORK_DIR}/src ./src

# Build application
RUN mvn -B -f /app/pom.xml clean package \
    -Dmaven.test.skip=true \
    -DskipTests


# =========================
# Runtime Stage
# =========================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /opt/egov

# Copy application jar
COPY --from=build /app/target/*.jar /opt/egov/app.jar

# Copy startup script
COPY --from=build /app/start.sh /opt/egov/start.sh

# Copy certificates if available
COPY --from=build /app/src/main/resources/*.cer /tmp/certs/

# Import certificates if present
RUN if [ -d /tmp/certs ] && [ "$(ls -A /tmp/certs 2>/dev/null)" ]; then \
      for cert in /tmp/certs/*.cer; do \
        echo "Importing certificate: $cert"; \
        keytool -importcert \
          -alias "$(basename "$cert" .cer)" \
          -trustcacerts \
          -keystore $JAVA_HOME/lib/security/cacerts \
          -file "$cert" \
          -storepass changeit \
          -noprompt; \
      done; \
    else \
      echo "No certificates found, skipping import."; \
    fi

# Make script executable
RUN chmod +x /opt/egov/start.sh

# Start application
CMD ["/opt/egov/start.sh"]

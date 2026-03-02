FROM egovio/alpine-maven-builder-jdk-8:1-master-NA-6036091e AS build  
ARG WORK_DIR
WORKDIR /app

# copy the project files
COPY ${WORK_DIR}/pom.xml ./pom.xml
COPY build/maven/start.sh ./start.sh

COPY ${WORK_DIR}/src ./src
RUN mvn -B -f /app/pom.xml package -Dmaven.test.skip=true -DskipTests

# Create runtime image
FROM egovio/8-openjdk-alpine

WORKDIR /opt/egov

COPY --from=build /app/target/*.jar /app/start.sh /opt/egov/

# --- NEW CONDITIONAL SECTION ---
# 1. Attempt to copy .cer files (the wildcard prevents error if none exist)
COPY --from=build /app/src/main/resources/*.cer cert.cer 2>/dev/null || true

# 2. If cert.cer exists, import it; otherwise, move to next step
RUN if [ -f cert.cer ]; then \
      keytool -importcert -alias smsgwsmsgovin -trustcacerts \
      -keystore $JAVA_HOME/jre/lib/security/cacerts \
      -file cert.cer -storepass changeit -noprompt; \
    else \
      echo "No certificate found, moving to next step..."; \
    fi
# -------------------------------

RUN chmod +x /opt/egov/start.sh

CMD ["/opt/egov/start.sh"]

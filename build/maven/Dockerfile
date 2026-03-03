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

# --- NEW CONDITIONAL SECTION ----------------------------------------------
# 1. Attempt to copy .cer files (the wildcard prevents error if none exist)
COPY --from=build /app/src/main/resources /tmp/resources

# Import all .cer certificates if present
RUN if ls /tmp/resources/*.cer 1> /dev/null 2>&1; then \
      for cert in /tmp/resources/*.cer; do \
        keytool -importcert -alias "$(basename $cert .cer)" -trustcacerts \
        -keystore $JAVA_HOME/jre/lib/security/cacerts \
        -file "$cert" -storepass changeit -noprompt; \
      done; \
    else \
      echo "No certificate found, moving to next step..."; \
    fi
#--------------------------------------------------------------------

RUN chmod +x /opt/egov/start.sh

CMD ["/opt/egov/start.sh"]

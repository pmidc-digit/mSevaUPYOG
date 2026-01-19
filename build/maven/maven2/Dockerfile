FROM upyogio/alpine-maven-builder-jdk-8:1-master-NA-6036091e AS build
# FROM ghcr.io/egovernments/alpine-maven-builder-jdk-8:1-master-na-6036091e AS build
ARG WORK_DIR
WORKDIR /app

# copy the project files
COPY ${WORK_DIR}/pom.xml ./pom.xml

# not useful for stateless builds
# RUN mvn -B dependency:go-offline

COPY ${WORK_DIR}/src ./src
RUN mvn -B -f /app/pom.xml package -Dmaven.test.skip=true -DskipTests

RUN ls -lh /app/target

# Create runtime image
FROM tomcat:9-jdk8-temurin

COPY --from=build /app/target/ticket.war /usr/local/tomcat/webapps/ticket.war

EXPOSE 8080
CMD ["catalina.sh", "run"]


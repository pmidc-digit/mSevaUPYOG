FROM openjdk:8-jre-alpine

WORKDIR /opt/egov

COPY target/invest-punjab-integration-*.jar app.jar

EXPOSE 8096

CMD ["java", "-jar", "app.jar"]

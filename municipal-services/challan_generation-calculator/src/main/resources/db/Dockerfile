FROM egovio/flyway:10.7.1

# Create migration directory first
RUN mkdir -p /flyway/sql

# Corrected copy path
COPY ./src/main/resources/db/migration/main /flyway/sql

# Copy migrate script
COPY ./src/main/resources/db/migrate.sh /usr/bin/migrate.sh

RUN chmod +x /usr/bin/migrate.sh

ENTRYPOINT ["/usr/bin/migrate.sh"]

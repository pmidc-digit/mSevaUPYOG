#!/bin/sh

flyway \
  -url=jdbc:postgresql://localhost:5432/pg1 \
  -table=public \
  -user=postgres \
  -password=postgres \
  -locations=db/migration/main \
  -baselineOnMigrate=true \
  -outOfOrder=false \
  -ignoreMissingMigrations=true \
  migrate

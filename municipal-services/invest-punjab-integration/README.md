# Invest Punjab Integration Service (`invest-punjab-integration`)

## Overview
`invest-punjab-integration` is an asynchronous integration microservice built for DIGIT / Local Government (LG) Portal integration with the **Invest Punjab - FastTrack Punjab Portal** (Technical Specifications v1.2, NIC Punjab).

It follows the asynchronous event-driven architecture pattern of `egov-notification-sms`:
- Consumes status update events via Kafka (`update-invest-punjab-status`).
- Manages Invest Punjab JWT authentication tokens using **Redis Cache** with an automated **30-second expiry safety buffer**.
- Sends real-time application updates to Invest Punjab FastTrack portal (`POST /api/localgovt/updateStatus`).
- Emits structured results to **Kafka Success Topic** (`invest-punjab-status-success`) and **Kafka Error Topic** (`invest-punjab-status-error`) for real-time dashboards, audit trails, and alert pipelines.

---

## Key Features

### 1. Redis Token Caching with 30-Second Safety Buffer
FastTrack Invest Punjab requires a JWT Bearer token obtained from `POST /api/iptoken/gettoken/v1`.
- **Cache Storage**: Stored in Redis under key `INVEST_PUNJAB_AUTH_TOKEN` with the API-provided `expiresIn` TTL.
- **TTL Check Rule**: On every incoming request:
  - If `remainingTTL > 30 seconds`: Cached token is reused immediately (zero HTTP latency).
  - If `token == null` or `remainingTTL <= 30 seconds`: Automatically invokes Invest Punjab token API, caches the new token in Redis, and uses it.
- **Concurrency Protection**: Thread-safe with `ReentrantLock` and double-checked locking so concurrent Kafka consumers never trigger duplicate token requests.
- **Auto In-Memory Fallback**: If Redis server is temporarily offline, the service automatically falls back to an internal thread-safe memory cache.
- **Auto Recovery**: On receiving `401 Unauthorized` or error code `IPBF101` (Token Expired), cache is invalidated, fresh token generated, and the request retried.

### 2. Dual Kafka Topic Pipeline for Dashboards
- **Consume Topic**: `${kafka.topics.invest.punjab.status.update}` (Default: `update-invest-punjab-status`)
  - Any service (Trade License, Water, Sewerage, Workflow) publishes events to this topic.
- **Success Topic**: `${kafka.topics.invest.punjab.status.success}` (Default: `invest-punjab-status-success`)
  - Successfully posted updates are broadcast here. Consumed by analytics, persisters, and dashboards.
- **Error Topic**: `${kafka.topics.invest.punjab.status.error}` (Default: `invest-punjab-status-error`)
  - Failed events (network failures, invalid payloads, portal error codes) are pushed here for alerting, retries, and error monitoring.

---

## API Endpoints

Base URL: `http://localhost:8096/invest-punjab-integration`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/invest-punjab-integration/v1/status/_update` | Update status directly on Invest Punjab portal |
| `POST` | `/invest-punjab-integration/v1/token/_get` | Get valid token (from Redis cache or freshly generated) |
| `POST` | `/invest-punjab-integration/v1/token/_refresh` | Force refresh token in Redis |
| `POST` | `/invest-punjab-integration/v1/applicant/_get` | Fetch Common Application Form (CAF) details by `iPin` |
| `POST` | `/invest-punjab-integration/v1/auth/_decrypt` | Decrypt AES-128-ECB login payload from Invest Punjab |
| `POST` | `/invest-punjab-integration/v1/checksum/_calculate` | Calculate/verify HMAC-SHA256 CheckSUM |
| `GET`  | `/invest-punjab-integration/v1/health` | Health check and Redis token remaining TTL |

---

## Configuration Properties (`application.properties`)

```properties
# Server
server.port=8096
server.servlet.context-path=/invest-punjab-integration

# Kafka Topics
kafka.topics.invest.punjab.status.update=update-invest-punjab-status
kafka.topics.invest.punjab.status.success=invest-punjab-status-success
kafka.topics.invest.punjab.status.error=invest-punjab-status-error

# Redis
spring.redis.host=localhost
spring.redis.port=6379

# Invest Punjab Integration (Staging Active)
invest.punjab.base.url=https://fasttrack.punjab.gov.in
invest.punjab.token.path=/integration-staging/api/iptoken/gettoken/v1
invest.punjab.status.path=/integration-staging/api/localgovt/updateStatus
invest.punjab.caf.path=/integration-staging/api/localgovt/getCAFData
invest.punjab.integration.key=UAT_LG

# Token Caching Strategy
invest.punjab.token.cache.key=INVEST_PUNJAB_AUTH_TOKEN
invest.punjab.token.min.buffer.seconds=30
invest.punjab.token.default.ttl=3600

# Security Keys
invest.punjab.aes.secret.key=N78I99C8t--L0008
invest.punjab.checksum.secret.key=BF9EFK9tEbJF
```

---

## Build & Run

```bash
cd D:/Mseva2/mSevaUPYOG/municipal-services/invest-punjab-integration
mvn clean package -DskipTests
java -jar target/invest-punjab-integration-1.0.0-SNAPSHOT.jar
```

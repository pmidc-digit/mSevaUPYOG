# Local Setup

To setup the FireNOC Calculator Service (`firenoc-calculator`) locally, clone the [UPYOG Repository](https://github.com/upyog/UPYOG) and navigate to `municipal-services/firenoc-calculator`.

## Runtime

- Node.js `18.20.8` via `.nvmrc`
- npm `10.x`

If you use `nvm`, switch first:

```bash
nvm use
```

## Dependencies

### Infra Dependency

- [x] Postgres DB
- [ ] Redis
- [ ] Elasticsearch
- [x] Kafka
  - [ ] Consumer
  - [x] Producer

## Running Locally

Install dependencies:

```bash
npm install
```

Create a local environment file from the example and adjust values if needed:

```bash
cp .env.example .env
```

To run the FireNOC Calculator Service (firenoc-calculator) locally, you need to run the below command to port forward below services

```bash
 function kgpt(){kubectl get pods -n egov --selector=app=$1 --no-headers=true | head -n1 | awk '{print $1}'}

 kubectl port-forward -n egov $(kgpt billing-service) 8084:8080 &
 kubectl port-forward -n egov $(kgpt egov-mdms-service) 8085:8080 &
 kubectl port-forward -n egov $(kgpt firenoc-service) 8086:8080
``` 

Set or override the following environment values before running the project:

```ini
EGOV_BILLINGSERVICE_HOST=http://localhost:8084
EGOV_MDMS_HOST=http://localhost:8085
EGOV_FIRENOC_SERVICE_HOST=http://localhost:8086
DB_SSL=false
```

Run the service:

```bash
npm run dev
```

For a production-style local smoke test:

```bash
npm run build
npm start
```

The service starts on `http://localhost:8083` by default.

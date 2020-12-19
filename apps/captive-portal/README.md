# Running Captive Portal Locally

Development level secrets override found in the `.env` file located in the root of the app package.

```ini
PORT=8081
GRAPHQL_API_HOST="http://localhost:${GRAPHQL_API_LOCAL_PORT}"
GRAPHQL_API_TOKEN="${GRAPHQL_API_LOCAL_TOKEN}"
```

```bash
yarn dev --scope @ha/captive-portal-app
```

Visit [http://localhost:8081](http://localhost:8081).

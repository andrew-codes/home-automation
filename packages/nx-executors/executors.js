{
  "executors": {
    "initialize-secrets": {
      "implementation": "./dist/initialize-secrets",
      "schema": "./src/executors/initialize-secrets/schema.json",
      "description": "Initialize secrets to defautl values in key vault."
    },
    "invoke": {
      "implementation": "./dist/invoke",
      "schema": "./src/executors/invoke/schema.json",
      "description": "Invoke a module with injected configuration API."
    },
    "run-with-az": {
      "implementation": "./dist/run-with-az",
      "schema": "./src/executors/run-with-az/schema.json",
      "description": "Execute shell command with logged in az"
    },
    "telepresence": {
      "implementation": "./dist/telepresence",
      "schema": "./src/executors/telepresence/schema.json",
      "description": "Run local apps via Telepresence."
    },
    "upload-codecov": {
      "implementation": "./dist/upload-codecov",
      "schema": "./src/executors/upload-codecov/schema.json",
      "description": "Upload code cov reports for a project."
    }
  }
}

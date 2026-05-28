# Deploy VW Microservices to Azure Container Apps with ACR

This guide deploys the VW microservice web application to Azure Container Apps using Azure Container Registry for images and Azure Database for PostgreSQL Flexible Server for persistence.

The deployment keeps the architecture simple:

- `frontend` Container App: public HTTPS ingress
- `auth-service` Container App: public HTTPS ingress
- `vehicle-service` Container App: public HTTPS ingress
- `profile-service` Container App: public HTTPS ingress
- Azure Container Registry: stores Docker images
- Azure Database for PostgreSQL Flexible Server: stores service databases

The backend APIs use public ingress because the current React/Vite frontend is a static browser app. Browser code must call API URLs directly unless you later add an API gateway, reverse proxy, or backend-for-frontend.

## 1. Prerequisites

Install or prepare:

- Azure subscription
- Azure CLI
- Docker, if building locally
- GitHub repository containing this code
- GitHub CLI, optional but useful
- Permission to create resource groups, ACR, Container Apps, identities, role assignments, and PostgreSQL

Why: these tools and permissions are needed to create Azure resources, push images, and allow Container Apps to pull from ACR.

Check Azure CLI:

```bash
az version
az login
```

Select your subscription:

```bash
az account set --subscription "<YOUR_SUBSCRIPTION_ID>"
```

Why: avoids deploying resources into the wrong Azure subscription.

## 2. Define Deployment Variables

Run these in Bash or Azure Cloud Shell.

```bash
export LOCATION="eastus"
export RESOURCE_GROUP="rg-vw-microservices-dev"
export ACR_NAME="vwacr$RANDOM$RANDOM"
export ACR_LOGIN_SERVER="$ACR_NAME.azurecr.io"

export ACA_ENV="vw-containerapps-env"

export AUTH_APP="auth-service"
export VEHICLE_APP="vehicle-service"
export PROFILE_APP="profile-service"
export FRONTEND_APP="frontend"

export PG_SERVER="vw-postgres-$RANDOM$RANDOM"
export PG_ADMIN="vwadmin"
export PG_PASSWORD="<CREATE_A_STRONG_PASSWORD>"

export JWT_SECRET="<CREATE_A_LONG_RANDOM_ACCESS_SECRET>"
export JWT_REFRESH_SECRET="<CREATE_A_LONG_RANDOM_REFRESH_SECRET>"
```

Why: variables make the commands repeatable and reduce copy/paste mistakes.

Important:

- `ACR_NAME` must be globally unique, lowercase, and alphanumeric.
- `PG_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` should be strong.
- If your PostgreSQL password contains URL-special characters, URL-encode it before using it in `DATABASE_URL`.

## 3. Install Azure Container Apps CLI Support

```bash
az extension add --name containerapp --upgrade

az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.DBforPostgreSQL
```

Why: Container Apps and related services require Azure resource providers and the Container Apps CLI extension.

## 4. Create the Resource Group

```bash
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"
```

Why: the resource group keeps all learning/deployment resources together for easier management and cleanup.

## 5. Create Azure Container Registry

```bash
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Basic \
  --admin-enabled false
```

Why: ACR stores private Docker images for your microservices. Admin login is disabled because managed identity and Azure RBAC are cleaner.

Check the login server:

```bash
az acr show \
  --name "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query loginServer \
  --output tsv
```

## 6. Create Azure Database for PostgreSQL

Create the PostgreSQL Flexible Server:

```bash
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PG_SERVER" \
  --location "$LOCATION" \
  --admin-user "$PG_ADMIN" \
  --admin-password "$PG_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --public-access 0.0.0.0
```

Why: the app needs persistent PostgreSQL storage. Flexible Server is a managed database, unlike a PostgreSQL container with ephemeral storage.

Create the three service databases:

```bash
az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$PG_SERVER" \
  --database-name authdb

az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$PG_SERVER" \
  --database-name vehicledb

az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$PG_SERVER" \
  --database-name profiledb
```

Why: each microservice owns its own database, matching the service boundaries in the project.

Build connection strings:

```bash
export PG_HOST="$PG_SERVER.postgres.database.azure.com"

export AUTH_DATABASE_URL="postgresql://$PG_ADMIN:$PG_PASSWORD@$PG_HOST:5432/authdb?sslmode=require"
export VEHICLE_DATABASE_URL="postgresql://$PG_ADMIN:$PG_PASSWORD@$PG_HOST:5432/vehicledb?sslmode=require"
export PROFILE_DATABASE_URL="postgresql://$PG_ADMIN:$PG_PASSWORD@$PG_HOST:5432/profiledb?sslmode=require"
```

Why: Container Apps inject these URLs into each service through environment variables.

## 7. Create the Container Apps Environment

```bash
az containerapp env create \
  --name "$ACA_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION"
```

Why: a Container Apps environment is the shared boundary where your apps run and communicate.

## 8. Configure GitHub OIDC for the Build Workflow

Create an Entra application for GitHub Actions:

```bash
export GITHUB_OWNER="<YOUR_GITHUB_USERNAME_OR_ORG>"
export GITHUB_REPO="<YOUR_REPO_NAME>"
export GH_APP_NAME="vw-github-actions-acr"

export AZURE_CLIENT_ID=$(az ad app create \
  --display-name "$GH_APP_NAME" \
  --query appId \
  --output tsv)

az ad sp create --id "$AZURE_CLIENT_ID"

export AZURE_TENANT_ID=$(az account show --query tenantId --output tsv)
export AZURE_SUBSCRIPTION_ID=$(az account show --query id --output tsv)
export GH_SP_OBJECT_ID=$(az ad sp show --id "$AZURE_CLIENT_ID" --query id --output tsv)
```

Why: GitHub Actions needs a trusted Azure identity to log in without storing a long-lived client secret.

Create the federated credential for pushes to `main`:

```bash
az ad app federated-credential create \
  --id "$AZURE_CLIENT_ID" \
  --parameters "{\"name\":\"github-main\",\"issuer\":\"https://token.actions.githubusercontent.com\",\"subject\":\"repo:$GITHUB_OWNER/$GITHUB_REPO:ref:refs/heads/main\",\"audiences\":[\"api://AzureADTokenExchange\"]}"
```

Why: this tells Azure to trust tokens issued by your specific GitHub repo and branch.

Grant push permission to ACR:

```bash
export ACR_ID=$(az acr show \
  --name "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query id \
  --output tsv)

az role assignment create \
  --assignee-object-id "$GH_SP_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role AcrPush \
  --scope "$ACR_ID"
```

Why: the workflow must be allowed to push Docker images into your registry.

## 9. Add GitHub Secrets and Variables

Using GitHub CLI:

```bash
gh secret set AZURE_CLIENT_ID --body "$AZURE_CLIENT_ID"
gh secret set AZURE_TENANT_ID --body "$AZURE_TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$AZURE_SUBSCRIPTION_ID"

gh variable set ACR_NAME --body "$ACR_NAME"
gh variable set VITE_AUTH_API_URL --body "https://placeholder.example.com/api/auth"
gh variable set VITE_VEHICLE_API_URL --body "https://placeholder.example.com/api/vehicles"
gh variable set VITE_PROFILE_API_URL --body "https://placeholder.example.com/api/profile"
```

Or add them manually in GitHub:

```text
Repository -> Settings -> Secrets and variables -> Actions
```

Secrets:

```text
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
```

Variables:

```text
ACR_NAME
VITE_AUTH_API_URL
VITE_VEHICLE_API_URL
VITE_PROFILE_API_URL
```

Why: the workflow uses secrets for Azure login and variables for build-time image/API configuration.

## 10. Run the GitHub Workflow Once

Commit and push the workflow file:

```bash
git add .github/workflows/build-and-push-acr.yml
git commit -m "Add ACR build workflow"
git push origin main
```

Then open:

```text
GitHub -> Actions -> Build and Push Docker Images to ACR
```

Why: this first run builds and pushes backend images needed for initial Container Apps deployment. The frontend image will be rebuilt later after real API URLs are known.

Check images in ACR:

```bash
az acr repository list \
  --name "$ACR_NAME" \
  --output table
```

Expected repositories:

```text
auth-service
vehicle-service
profile-service
frontend
```

## 11. Deploy the Auth Service

```bash
az containerapp create \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ACA_ENV" \
  --image "$ACR_LOGIN_SERVER/auth-service:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity system \
  --target-port 4001 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --secrets database-url="$AUTH_DATABASE_URL" jwt-secret="$JWT_SECRET" jwt-refresh-secret="$JWT_REFRESH_SECRET" \
  --env-vars \
    PORT=4001 \
    NODE_ENV=production \
    DATABASE_URL=secretref:database-url \
    JWT_SECRET=secretref:jwt-secret \
    JWT_REFRESH_SECRET=secretref:jwt-refresh-secret \
    ACCESS_TOKEN_EXPIRES_IN=15m \
    REFRESH_TOKEN_EXPIRES_IN=7d \
    CORS_ORIGIN=https://temporary.local
```

Why: this starts the authentication API and lets it pull its image securely from ACR using managed identity.

## 12. Deploy the Vehicle Service

```bash
az containerapp create \
  --name "$VEHICLE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ACA_ENV" \
  --image "$ACR_LOGIN_SERVER/vehicle-service:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity system \
  --target-port 4002 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --secrets database-url="$VEHICLE_DATABASE_URL" jwt-secret="$JWT_SECRET" \
  --env-vars \
    PORT=4002 \
    NODE_ENV=production \
    DATABASE_URL=secretref:database-url \
    JWT_SECRET=secretref:jwt-secret \
    CORS_ORIGIN=https://temporary.local
```

Why: this starts the vehicle catalog API and initializes vehicle tables plus seed data on startup.

## 13. Deploy the Profile Service

```bash
az containerapp create \
  --name "$PROFILE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ACA_ENV" \
  --image "$ACR_LOGIN_SERVER/profile-service:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity system \
  --target-port 4003 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --secrets database-url="$PROFILE_DATABASE_URL" jwt-secret="$JWT_SECRET" \
  --env-vars \
    PORT=4003 \
    NODE_ENV=production \
    DATABASE_URL=secretref:database-url \
    JWT_SECRET=secretref:jwt-secret \
    CORS_ORIGIN=https://temporary.local
```

Why: this starts protected profile APIs using the same access token secret as the auth service.

## 14. Capture Backend API URLs

```bash
export AUTH_FQDN=$(az containerapp show \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

export VEHICLE_FQDN=$(az containerapp show \
  --name "$VEHICLE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

export PROFILE_FQDN=$(az containerapp show \
  --name "$PROFILE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "https://$AUTH_FQDN/api/auth"
echo "https://$VEHICLE_FQDN/api/vehicles"
echo "https://$PROFILE_FQDN/api/profile"
```

Why: Vite embeds API URLs at frontend build time, so the frontend must be rebuilt with the real backend URLs.

## 15. Update GitHub Frontend API Variables

```bash
gh variable set VITE_AUTH_API_URL --body "https://$AUTH_FQDN/api/auth"
gh variable set VITE_VEHICLE_API_URL --body "https://$VEHICLE_FQDN/api/vehicles"
gh variable set VITE_PROFILE_API_URL --body "https://$PROFILE_FQDN/api/profile"
```

Why: the frontend Docker image needs the actual Azure API URLs during `npm run build`.

Re-run the workflow:

```bash
gh workflow run build-and-push-acr.yml --ref main
```

Or use:

```text
GitHub -> Actions -> Build and Push Docker Images to ACR -> Run workflow
```

Why: this rebuilds and pushes the frontend image with correct API URLs.

## 16. Deploy the Frontend

```bash
az containerapp create \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ACA_ENV" \
  --image "$ACR_LOGIN_SERVER/frontend:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity system \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2
```

Why: this exposes the React/Vite web app to users over Azure Container Apps HTTPS ingress.

Capture the frontend URL:

```bash
export FRONTEND_FQDN=$(az containerapp show \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "https://$FRONTEND_FQDN"
```

## 17. Update Backend CORS

```bash
az containerapp update \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars CORS_ORIGIN="https://$FRONTEND_FQDN"

az containerapp update \
  --name "$VEHICLE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars CORS_ORIGIN="https://$FRONTEND_FQDN"

az containerapp update \
  --name "$PROFILE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars CORS_ORIGIN="https://$FRONTEND_FQDN"
```

Why: browsers enforce CORS, so each API must explicitly allow the deployed frontend origin.

## 18. Test the Deployment

Test service health:

```bash
curl "https://$AUTH_FQDN/health"
curl "https://$VEHICLE_FQDN/health"
curl "https://$PROFILE_FQDN/health"
```

Why: confirms each container is reachable and running.

Open the app:

```text
https://<FRONTEND_FQDN>
```

Test the user flow:

1. Register a new user.
2. Open the dashboard.
3. Browse vehicles.
4. Open a vehicle details page.
5. Save a vehicle.
6. Open the profile page.

Why: this validates auth, frontend API URLs, CORS, database connectivity, and protected profile APIs.

## 19. Deploy Future Code Changes

Push to `main`:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Why: the GitHub workflow builds and pushes fresh Docker images tagged with both `latest` and the commit SHA.

Get the commit SHA:

```bash
export IMAGE_TAG="<GITHUB_COMMIT_SHA>"
```

Update Container Apps to the new images:

```bash
az containerapp update \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_LOGIN_SERVER/auth-service:$IMAGE_TAG"

az containerapp update \
  --name "$VEHICLE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_LOGIN_SERVER/vehicle-service:$IMAGE_TAG"

az containerapp update \
  --name "$PROFILE_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_LOGIN_SERVER/profile-service:$IMAGE_TAG"

az containerapp update \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --image "$ACR_LOGIN_SERVER/frontend:$IMAGE_TAG"
```

Why: using the commit SHA gives you a clear, traceable deployment version.

## 20. Optional: Enable Deployment in GitHub Actions

The workflow contains a commented Azure Container Apps deployment block.

To enable it:

1. Add this GitHub variable:

```text
AZURE_RESOURCE_GROUP=rg-vw-microservices-dev
```

2. Make sure your Container App names match the matrix names:

```text
auth-service
vehicle-service
profile-service
frontend
```

3. Grant the GitHub identity permission to update Container Apps:

```bash
az role assignment create \
  --assignee-object-id "$GH_SP_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role Contributor \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"
```

4. Uncomment the deploy step in `.github/workflows/build-and-push-acr.yml`.

Why: this turns the workflow from build-and-push into build-push-deploy.

## 21. Useful Logs and Diagnostics

Show app logs:

```bash
az containerapp logs show \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --follow
```

Why: logs are the fastest way to debug startup, database, token, and CORS issues.

Show current revisions:

```bash
az containerapp revision list \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --output table
```

Why: Container Apps creates revisions when configuration or images change.

Check app details:

```bash
az containerapp show \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --output table
```

Why: confirms image, ingress, environment, and provisioning state.

## 22. Common Troubleshooting

### Image pull fails

Check that `--registry-identity system` was used and the app has pull access to ACR.

Why: Container Apps needs permission to pull private images.

Manual role assignment if needed:

```bash
export APP_PRINCIPAL_ID=$(az containerapp identity show \
  --name "$AUTH_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query principalId \
  --output tsv)

az role assignment create \
  --assignee "$APP_PRINCIPAL_ID" \
  --role AcrPull \
  --scope "$ACR_ID"
```

### Database connection fails

Check:

- `DATABASE_URL` includes `sslmode=require`
- databases `authdb`, `vehicledb`, `profiledb` exist
- PostgreSQL firewall allows Azure services
- password is URL-encoded if it contains special characters

Why: most PostgreSQL deployment issues come from connection string or firewall configuration.

### Browser API calls fail

Check:

- frontend was rebuilt after backend FQDNs were known
- `VITE_*_API_URL` values include `/api/auth`, `/api/vehicles`, `/api/profile`
- backend `CORS_ORIGIN` equals `https://<frontend-fqdn>`

Why: React/Vite API URLs are build-time values and browser CORS must match exactly.

### Login works but profile fails

Check:

- `JWT_SECRET` is identical in auth, vehicle, and profile services
- profile service has `DATABASE_URL`
- profile service logs show successful startup

Why: profile routes verify access tokens created by auth service.

## 23. Cleanup

Delete everything:

```bash
az group delete \
  --name "$RESOURCE_GROUP" \
  --yes \
  --no-wait
```

Why: deleting the resource group removes the learning environment and stops Azure charges.

## References

- Azure Container Apps quickstart and CLI extension guidance: https://learn.microsoft.com/en-us/azure/container-apps/get-started
- Azure Container Apps ingress: https://learn.microsoft.com/azure/container-apps/ingress-overview
- Azure Container Apps secrets and secret references: https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets
- Azure Container Apps image pull from ACR with managed identity: https://learn.microsoft.com/en-us/azure/container-apps/managed-identity-image-pull
- Azure Container Registry authentication: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication
- Azure Database for PostgreSQL Flexible Server quickstart: https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server
- PostgreSQL firewall rule for Azure services: https://learn.microsoft.com/en-us/azure/postgresql/network/how-to-networking-servers-deployed-public-access-add-firewall-rules
- Azure login from GitHub Actions with OIDC: https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions

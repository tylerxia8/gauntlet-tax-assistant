param(
  [string]$ApiKey = $env:RENDER_API_KEY,
  [string]$OwnerId = "",
  [string]$ServiceName = "gauntlet-tax-assistant"
)

$ErrorActionPreference = "Stop"

if (-not $ApiKey) {
  throw "Set RENDER_API_KEY or pass -ApiKey. Create it in Render Account Settings."
}

$headers = @{
  "Authorization" = "Bearer $ApiKey"
  "Accept" = "application/json"
  "Content-Type" = "application/json"
}

if (-not $OwnerId) {
  $owners = Invoke-RestMethod -Method Get -Uri "https://api.render.com/v1/owners?limit=20" -Headers $headers
  if (-not $owners -or $owners.Count -eq 0) {
    throw "No Render workspaces were returned for this API key."
  }
  $OwnerId = $owners[0].owner.id
  Write-Host "Using Render workspace $OwnerId"
}

$payload = @{
  type = "static_site"
  name = $ServiceName
  ownerId = $OwnerId
  repo = "https://github.com/tylerxia8/gauntlet-tax-assistant"
  branch = "master"
  autoDeploy = "yes"
  serviceDetails = @{
    buildCommand = "npm install"
    publishPath = "."
  }
} | ConvertTo-Json -Depth 8

try {
  $service = Invoke-RestMethod -Method Post -Uri "https://api.render.com/v1/services" -Headers $headers -Body $payload
} catch {
  $responseBody = $_.ErrorDetails.Message
  if ($responseBody) {
    throw "Render service creation failed: $responseBody"
  }
  throw
}

$serviceId = $service.service.id
$serviceUrl = $service.service.serviceDetails.url
Write-Host "Created Render static site: $serviceId"
if ($serviceUrl) {
  Write-Host "URL: $serviceUrl"
}

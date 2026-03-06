if ([string]::IsNullOrWhiteSpace($env:SONAR_TOKEN)) {
  Write-Error "SONAR_TOKEN is missing. Please set it in this PowerShell session before running the script."
  exit 1
}

Push-Location "$PSScriptRoot\..\backend"

dotnet sonarscanner begin `
 /k:"mailmarketing" `
 /n:"2M-MailMarketing" `
 /v:"1.0" `
 /d:sonar.host.url="http://localhost:9000" `
 /d:sonar.login="$env:SONAR_TOKEN"

dotnet build src/MailMarketing.Api

dotnet sonarscanner end /d:sonar.login="$env:SONAR_TOKEN"

Pop-Location

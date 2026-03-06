param(
  [switch]$InstallNodeDeps
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path "$PSScriptRoot\.."
$uiRoot = Join-Path $repoRoot "frontend\mail-marketing-ui"
$seleniumRoot = Join-Path $uiRoot "tests\selenium\java"

if ($InstallNodeDeps -and -not (Test-Path (Join-Path $uiRoot "node_modules"))) {
  Write-Host "Installing frontend dependencies..."
  Push-Location $uiRoot
  npm install
  Pop-Location
}

if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
  throw "Maven (mvn) is not installed or not in PATH. Install Maven or use a Maven-enabled CI image."
}

Push-Location $seleniumRoot
try {
  mvn test
}
finally {
  Pop-Location
}

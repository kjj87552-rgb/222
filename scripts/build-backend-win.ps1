Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ".."))
$venvDir = Join-Path $rootDir ".venv-package"
$buildDir = Join-Path $rootDir "build"
$backendOutDir = Join-Path $buildDir "backend"
$pyinstallerWorkDir = Join-Path $buildDir "pyinstaller"
$templateDir = Join-Path $rootDir "backend\design_prompt_templates"

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)][string]$Label,
    [Parameter(Mandatory = $true)][scriptblock]$Command
  )
  Write-Host "==> $Label"
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE"
  }
}

function Remove-ChildPath {
  param([Parameter(Mandatory = $true)][string]$PathToRemove)
  $rootFull = [System.IO.Path]::GetFullPath($rootDir)
  $targetFull = [System.IO.Path]::GetFullPath($PathToRemove)
  if (-not $targetFull.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove path outside project: $targetFull"
  }
  if (Test-Path -LiteralPath $targetFull) {
    Remove-Item -LiteralPath $targetFull -Recurse -Force
  }
}

Set-Location -LiteralPath $rootDir

if (-not (Test-Path -LiteralPath $templateDir)) {
  throw "Missing backend prompt template directory: backend\design_prompt_templates"
}

$templateCount = @(Get-ChildItem -LiteralPath $templateDir -Filter "*.md" -File).Count
if ($templateCount -le 0) {
  throw "No design prompt template markdown files found in backend\design_prompt_templates"
}

if (-not (Test-Path -LiteralPath $venvDir)) {
  Invoke-Checked "Create backend packaging venv" { python -m venv $venvDir }
}

$pythonExe = Join-Path $venvDir "Scripts\python.exe"
if (-not (Test-Path -LiteralPath $pythonExe)) {
  throw "Missing venv python: $pythonExe"
}

Invoke-Checked "Install backend packaging dependencies" {
  & $pythonExe -m pip install --upgrade pip setuptools wheel
}

Invoke-Checked "Install backend runtime dependencies" {
  & $pythonExe -m pip install -r (Join-Path $rootDir "backend\requirements.txt") "pyinstaller==6.20.0"
}

Remove-ChildPath $backendOutDir
Remove-ChildPath $pyinstallerWorkDir
New-Item -ItemType Directory -Force -Path $backendOutDir | Out-Null

$entryPoint = Join-Path $rootDir "backend\desktop_server.py"
$pyinstallerArgs = @(
  "--noconfirm",
  "--clean",
  "--name", "libai-backend",
  "--onedir",
  "--distpath", $backendOutDir,
  "--workpath", $pyinstallerWorkDir,
  "--specpath", $pyinstallerWorkDir,
  "--paths", $rootDir,
  "--collect-submodules", "backend",
  "--collect-submodules", "uvicorn",
  "--collect-submodules", "fastapi",
  "--collect-submodules", "starlette",
  "--collect-submodules", "pydantic",
  "--collect-submodules", "PIL",
  "--collect-submodules", "httpx",
  "--collect-submodules", "urllib3",
  "--collect-submodules", "websockets",
  "--collect-submodules", "anyio",
  "--collect-all", "boto3",
  "--collect-all", "botocore",
  "--collect-all", "s3transfer",
  "--collect-all", "jmespath",
  "--hidden-import", "h11",
  "--hidden-import", "boto3",
  "--hidden-import", "botocore.config",
  "--hidden-import", "s3transfer",
  "--hidden-import", "jmespath",
  $entryPoint
)

Invoke-Checked "Build packaged backend executable" {
  & $pythonExe -m PyInstaller @pyinstallerArgs
}

$backendExe = Join-Path $backendOutDir "libai-backend\libai-backend.exe"
if (-not (Test-Path -LiteralPath $backendExe)) {
  throw "Backend executable was not produced: build\backend\libai-backend\libai-backend.exe"
}

$backendInternalDir = Join-Path $backendOutDir "libai-backend\_internal"
$requiredS3RuntimePaths = @(
  "boto3",
  "botocore",
  "botocore\data",
  "s3transfer",
  "jmespath"
)
foreach ($relativeRuntimePath in $requiredS3RuntimePaths) {
  $runtimePath = Join-Path $backendInternalDir $relativeRuntimePath
  if (-not (Test-Path -LiteralPath $runtimePath)) {
    throw "Packaged backend is missing S3 runtime dependency: $relativeRuntimePath"
  }
}

Copy-Item -LiteralPath $templateDir -Destination (Join-Path $backendOutDir "design_prompt_templates") -Recurse -Force
$referenceStorageEnvFile = Join-Path $rootDir "backend\reference-storage.env"
if (Test-Path -LiteralPath $referenceStorageEnvFile) {
  Copy-Item -LiteralPath $referenceStorageEnvFile -Destination (Join-Path $backendOutDir "reference-storage.env") -Force
}
Write-Host "Backend runtime ready: build\backend"

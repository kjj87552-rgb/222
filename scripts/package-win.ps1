Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
$env:ELECTRON_BUILDER_DISABLE_UPDATE_NOTIFIER = "true"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ".."))
$rendererOutputDir = Join-Path $rootDir "dist"
$electronOutputDir = Join-Path $rootDir "release"

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

function Remove-WorkspaceChild {
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

if (-not (Test-Path -LiteralPath "node_modules")) {
  Invoke-Checked "Install node dependencies" { npm ci }
}

Remove-WorkspaceChild $electronOutputDir
Invoke-Checked "Prepare FFmpeg resources" { npm run ffmpeg:prepare }
Invoke-Checked "Check FFmpeg resources" { npm run ffmpeg:check }
Invoke-Checked "Build backend runtime" { npm run backend:package }
Invoke-Checked "Check backend syntax" { npm run backend:check }
Remove-WorkspaceChild $rendererOutputDir
Invoke-Checked "Build frontend renderer" { npm run build }
Invoke-Checked "Build Electron Windows installer" { npx electron-builder --win --publish never }

Write-Host "Windows package complete. Check the electron-builder output directory under release."

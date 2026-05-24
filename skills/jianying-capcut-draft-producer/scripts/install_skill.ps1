param(
  [string]$DestinationRoot = (Join-Path $env:USERPROFILE '.codex\skills')
)

$ErrorActionPreference = 'Stop'
$skillRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$skillName = Split-Path -Leaf $skillRoot
$destination = Join-Path $DestinationRoot $skillName

if (-not (Test-Path -LiteralPath $DestinationRoot)) {
  New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
}

if (Test-Path -LiteralPath $destination) {
  throw "Destination already exists: $destination"
}

Copy-Item -LiteralPath $skillRoot -Destination $destination -Recurse
Write-Output "Installed $skillName to $destination"


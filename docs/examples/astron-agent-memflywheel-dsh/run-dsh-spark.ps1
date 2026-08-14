param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Task,

  [ValidateSet('read-only', 'workspace-write', 'danger-full-access')]
  [string]$PermissionMode = 'read-only',

  [switch]$SkillDemo,

  [string]$DshCommand
)

$ErrorActionPreference = 'Stop'

$workspacePath = $PSScriptRoot
$runtimePath = Join-Path $workspacePath '.runtime'
$dshHomePath = Join-Path $runtimePath 'dsh-home'
$patchPath = Join-Path $workspacePath 'spark-ultra.patch.yml'
$skillDemoPatchPath = Join-Path $workspacePath 'skill-demo-tools.patch.yml'
$proxyPath = Join-Path $workspacePath 'spark-openai-proxy.mjs'
$astronBridgePath = Join-Path $workspacePath 'astron-skill-bridge.mjs'
$memFlywheelBridgeRoot = Join-Path $workspacePath 'memflywheel-bridge'
$memFlywheelBridgePath = Join-Path $memFlywheelBridgeRoot 'server.mjs'
$privateAstronExport = Join-Path $runtimePath 'astron-private\exported-original.SKILL.md'

function Test-LocalHealth {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Uri,

    [Parameter(Mandatory = $true)]
    [scriptblock]$Accept
  )

  try {
    $health = Invoke-RestMethod -Uri $Uri -TimeoutSec 2
    return [bool](& $Accept $health)
  }
  catch {
    return $false
  }
}

function Start-LocalNodeService {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptPath,

    [Parameter(Mandatory = $true)]
    [string]$WorkingDirectory,

    [Parameter(Mandatory = $true)]
    [string]$HealthUri,

    [Parameter(Mandatory = $true)]
    [scriptblock]$Accept,

    [Parameter(Mandatory = $true)]
    [string]$LogPrefix
  )

  if (Test-LocalHealth -Uri $HealthUri -Accept $Accept) {
    return
  }

  if (-not (Test-Path -LiteralPath $ScriptPath)) {
    throw "Required service script not found: $ScriptPath"
  }

  $nodePath = (Get-Command node -ErrorAction Stop).Source
  Start-Process -FilePath $nodePath -ArgumentList @($ScriptPath) -WorkingDirectory $WorkingDirectory -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $runtimePath "$LogPrefix.stdout.log") `
    -RedirectStandardError (Join-Path $runtimePath "$LogPrefix.stderr.log")

  for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
    Start-Sleep -Milliseconds 250
    if (Test-LocalHealth -Uri $HealthUri -Accept $Accept) {
      return
    }
  }

  throw "Local service did not become healthy: $HealthUri"
}

if ([string]::IsNullOrWhiteSpace($env:IFLYTEK_SPARK_API_PASSWORD)) {
  throw 'Set IFLYTEK_SPARK_API_PASSWORD to the Spark HTTP API APIPassword before running this script.'
}

New-Item -ItemType Directory -Force -Path $runtimePath, $dshHomePath | Out-Null

if ([string]::IsNullOrWhiteSpace($DshCommand)) {
  $localDsh = Join-Path $runtimePath 'dsh\node_modules\.bin\dsh.cmd'
  if (Test-Path -LiteralPath $localDsh) {
    $DshCommand = $localDsh
  }
  else {
    $DshCommand = (Get-Command dsh -ErrorAction Stop).Source
  }
}

Start-LocalNodeService `
  -ScriptPath $proxyPath `
  -WorkingDirectory $workspacePath `
  -HealthUri 'http://127.0.0.1:8788/health' `
  -Accept { param($health) $null -ne $health -and $health.ok -eq $true } `
  -LogPrefix 'spark-openai-proxy'

if ($SkillDemo) {
  $previousBridgeHost = $env:MEMFLYWHEEL_BRIDGE_HOST
  $previousBridgeHome = $env:MEMFLYWHEEL_HOME
  $env:MEMFLYWHEEL_BRIDGE_HOST = '127.0.0.1'
  $env:MEMFLYWHEEL_HOME = Join-Path $runtimePath 'memflywheel'
  try {
    Start-LocalNodeService `
      -ScriptPath $memFlywheelBridgePath `
      -WorkingDirectory $memFlywheelBridgeRoot `
      -HealthUri 'http://127.0.0.1:8787/health' `
      -Accept { param($health) $null -ne $health -and $health.ok -eq $true -and $health.package -eq '@iflytekopensource/memflywheel' } `
      -LogPrefix 'memflywheel-bridge'
  }
  finally {
    if ($null -eq $previousBridgeHost) { Remove-Item Env:MEMFLYWHEEL_BRIDGE_HOST -ErrorAction SilentlyContinue }
    else { $env:MEMFLYWHEEL_BRIDGE_HOST = $previousBridgeHost }
    if ($null -eq $previousBridgeHome) { Remove-Item Env:MEMFLYWHEEL_HOME -ErrorAction SilentlyContinue }
    else { $env:MEMFLYWHEEL_HOME = $previousBridgeHome }
  }

  $astronHealthAccept = { param($health) $null -ne $health -and $health.ok -eq $true -and $health.configured -eq $true }
  if (-not (Test-LocalHealth -Uri 'http://127.0.0.1:8789/health' -Accept $astronHealthAccept)) {
    if (-not (Test-Path -LiteralPath $privateAstronExport)) {
      throw "Place the private Astron-exported SKILL.md at: $privateAstronExport"
    }

    Start-LocalNodeService `
      -ScriptPath $astronBridgePath `
      -WorkingDirectory $workspacePath `
      -HealthUri 'http://127.0.0.1:8789/health' `
      -Accept $astronHealthAccept `
      -LogPrefix 'astron-skill-bridge'
  }
}

$previousDshHome = $env:DSH_HOME
$previousAgentsHome = $env:DSH_AGENTS_HOME
$previousTelemetryMode = $env:DSH_TELEMETRY_MODE
$previousPermissionMode = $env:DSH_PERMISSION_MODE
$env:DSH_HOME = $dshHomePath
$env:DSH_AGENTS_HOME = Join-Path $workspacePath '.agents'
$env:DSH_TELEMETRY_MODE = 'DISABLED'
$env:DSH_PERMISSION_MODE = $PermissionMode

Push-Location -LiteralPath $workspacePath
try {
  $dshArguments = @('--profile', 'headless', '--patch', $patchPath)
  if ($SkillDemo) {
    $dshArguments += @('--patch', $skillDemoPatchPath)
  }
  $dshArguments += $Task
  & $DshCommand @dshArguments
  exit $LASTEXITCODE
}
finally {
  Pop-Location
  if ($null -eq $previousDshHome) { Remove-Item Env:DSH_HOME -ErrorAction SilentlyContinue }
  else { $env:DSH_HOME = $previousDshHome }
  if ($null -eq $previousAgentsHome) { Remove-Item Env:DSH_AGENTS_HOME -ErrorAction SilentlyContinue }
  else { $env:DSH_AGENTS_HOME = $previousAgentsHome }
  if ($null -eq $previousTelemetryMode) { Remove-Item Env:DSH_TELEMETRY_MODE -ErrorAction SilentlyContinue }
  else { $env:DSH_TELEMETRY_MODE = $previousTelemetryMode }
  if ($null -eq $previousPermissionMode) { Remove-Item Env:DSH_PERMISSION_MODE -ErrorAction SilentlyContinue }
  else { $env:DSH_PERMISSION_MODE = $previousPermissionMode }
}

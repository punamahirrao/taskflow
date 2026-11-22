param(
    [ValidateSet('development', 'test', 'preprod')]
    [string]$Data = 'preprod',

    [int]$Port = 0
)

$ErrorActionPreference = 'Stop'
$env:TASKFLOW_DATA_ENV = $Data

if ($Port -eq 0) {
    $Port = switch ($Data) {
        'development' { 8000 }
        'preprod' { 8001 }
        'test' { 8002 }
    }
}

Push-Location $PSScriptRoot
try {
    & ./.venv/Scripts/python.exe manage.py migrate --noinput
    if ($LASTEXITCODE -ne 0) {
        throw 'Migrations failed.'
    }

    & ./.venv/Scripts/python.exe manage.py runserver "127.0.0.1:$Port"
} finally {
    Pop-Location
}

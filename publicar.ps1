# Script de publicación automática en GitHub para Rúbrica UniNorte
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Publicador de Rúbrica UniNorte en GitHub" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Git está inicializado
if (!(Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    git checkout -b main
} else {
    Write-Host "Repositorio Git ya inicializado." -ForegroundColor Green
}

# Añadir archivos y hacer commit
Write-Host "Preparando archivos para commit..." -ForegroundColor Yellow
git add .
git commit -m "Despliegue de aplicacion rubrica consolidada"

# Pedir la URL del repositorio remoto
Write-Host ""
Write-Host "Por favor, ingresa la URL de tu repositorio de GitHub." -ForegroundColor Green
Write-Host "(Ejemplo: https://github.com/tu-usuario/nombre-repositorio.git)" -ForegroundColor Green
$repoUrl = Read-Host "URL de GitHub"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "URL no válida. Operación cancelada." -ForegroundColor Red
    Exit
}

# Configurar el origen remoto
git remote remove origin 2>$null
git remote add origin $repoUrl

# Subir los archivos
Write-Host ""
Write-Host "Subiendo archivos a GitHub..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "¡Archivos subidos exitosamente a GitHub!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Siguientes pasos en la web de GitHub:"
    Write-Host "1. Abre tu repositorio en GitHub."
    Write-Host "2. Ve a Settings (Configuración) > Pages (Páginas)."
    Write-Host "3. En 'Build and deployment', bajo 'Source', selecciona 'Deploy from a branch'."
    Write-Host "4. En 'Branch', selecciona 'main' y la carpeta '/ (root)', y haz clic en Save."
    Write-Host "5. En un par de minutos, tu web estará lista en la dirección indicada por GitHub."
} else {
    Write-Host ""
    Write-Host "Ocurrió un error al subir los archivos. Por favor, asegúrate de:" -ForegroundColor Red
    Write-Host "1. Haber creado el repositorio en GitHub primero." -ForegroundColor Red
    Write-Host "2. Que el repositorio esté vacío y sea público." -ForegroundColor Red
    Write-Host "3. Tener los permisos de escritura correctos configurados en tu computadora." -ForegroundColor Red
}

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'
Write-Host "1. Descargando FFmpeg (esto puede tardar unos segundos)..."
Invoke-WebRequest -Uri "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip" -OutFile "ffmpeg.zip"

Write-Host "2. Extrayendo FFmpeg..."
Expand-Archive -Path ffmpeg.zip -DestinationPath .\ffmpeg_extracted -Force
$ffmpegPath = ".\ffmpeg_extracted\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"

Write-Host "3. Limpiando frames antiguos..."
Remove-Item -Path .\public\frames\* -Force -Recurse

Write-Host "4. Extrayendo frames en ALTA CALIDAD de video.mp4..."
# Extraemos a 24 fps con alta calidad (qscale:v 2)
& $ffmpegPath -i video.mp4 -vf fps=24 -qscale:v 2 .\public\frames\frame-%03d.jpg

Write-Host "5. Contando frames generados..."
$frames = Get-ChildItem -Path .\public\frames\*.jpg
Write-Host "RESULT_FRAME_COUNT=$($frames.Count)"

Write-Host "6. Limpiando archivos temporales..."
Remove-Item -Path ffmpeg.zip -Force
Remove-Item -Path .\ffmpeg_extracted -Recurse -Force

Write-Host "¡Proceso terminado con exito!"

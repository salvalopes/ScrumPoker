@echo off

IF "%~1"=="" (
  echo Usage: Install.bat [environment]
  echo.
  goto end
)

set rootDir=%~dp0

if %PROCESSOR_ARCHITECTURE%==x86 (
  set msbuild=%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\MSBuild.exe
) else (
  set msbuild=%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\amd64\MSBuild.exe
)

if not exist "%msbuild%" (
  echo MSBuild not found at "%msbuild%".
  echo Edit Install.bat to match the MSBuild path on your machine.
  goto end
)

"%msbuild%" "%rootDir%default.build" /t:PublishHost /p:Environment=%1

:end

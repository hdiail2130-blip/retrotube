@echo off
rem ==============================================================
rem   RetroTube PC Full Edition (Offline Standalone)
rem   Runs 100% locally from your PC with Full Original Contents!
rem   NO internet connection required!
rem ==============================================================
title RetroTube PC Full Edition (Offline Standalone)
echo.
echo  ==============================================================
echo    Starting RetroTube PC Offline Edition...
echo    Contains Full Original RetroTube Video Catalog & Player!
echo    Zero Internet Required - Running 100%% from Local PC Storage
echo  ==============================================================
echo.

set "OFFLINE_HTML=%~dp0RetroTube-Offline-Full-PC-Edition.html"

:: 1. Try Microsoft Edge in dedicated standalone app mode (built into Windows 10 & 11)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo [OK] Launching in Standalone Desktop Window...
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%OFFLINE_HTML%" --window-size=1280,820
    exit /b
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    echo [OK] Launching in Standalone Desktop Window...
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%OFFLINE_HTML%" --window-size=1280,820
    exit /b
)

:: 2. Try Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo [OK] Launching in Standalone Desktop Window...
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%OFFLINE_HTML%" --window-size=1280,820
    exit /b
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo [OK] Launching in Standalone Desktop Window...
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%OFFLINE_HTML%" --window-size=1280,820
    exit /b
)

:: 3. Fallback to default browser
echo [OK] Launching in default web browser...
start "" "%OFFLINE_HTML%"
exit /b

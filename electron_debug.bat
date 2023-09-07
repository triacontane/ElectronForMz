@ECHO OFF
SETLOCAL

REM Check if npm is installed
where npm >nul 2>nul
IF %errorlevel%==1 (
    CALL :installNode
) ELSE (
    CALL :runElectron
)

GOTO :EOF

:installNode
    ECHO npm not found in PATH.
    ECHO Please install Node.js from https://nodejs.org/
    PAUSE
    EXIT /B 1

:runElectron
    IF NOT EXIST node_modules (
        CALL :installModules
        IF %errorlevel% NEQ 0 (
            ECHO Failed to install node modules. Exiting.
            PAUSE
            EXIT /B 1
        )
    )
    ECHO Node modules installed.
    CALL :startElectron
    EXIT /B %errorlevel%

:installModules
    ECHO Installing node modules...
    npm install && exit
    IF %errorlevel% NEQ 0 (
        ECHO Failed to install node modules. Check the error message above.
        PAUSE
        EXIT /B 1
    )
    EXIT /B 0

:startElectron
    ECHO Starting Electron application...
    npm run debug && exit
    IF %errorlevel% NEQ 0 (
        ECHO Failed to start Electron application. Check the error message above.
        PAUSE
        EXIT /B 1
    )
    EXIT /B 0

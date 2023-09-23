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
    ECHO Please install Node.js from https://nodejs.org/ and Git from https://git-scm.com/
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
    CALL :updateRepository
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

:updateRepository
    ECHO Updating repository...
    git pull
    IF %errorlevel% NEQ 0 (
        ECHO Failed to update repository. Check the error message above.
        PAUSE
        EXIT /B 1
    ) ELSE (
      CALL :updateElectron
    )
    EXIT /B 0

:updateElectron
    ECHO Updating Electron packages...
    npm upgrade && exit
    IF %errorlevel% NEQ 0 (
        ECHO Failed to update Electron packages. Check the error message above.
        PAUSE
        EXIT /B 1
    )
    EXIT /B 0

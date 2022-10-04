@ECHO OFF
:: A2U
:: AUTHOR: CARLOS M.
:: DATE:   10-MAY-2011
 
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
SET ASCIIFile=%~f1
IF NOT DEFINED ASCIIFile GOTO :_A2UHLP_
IF "%~1"=="/?" GOTO :_A2UHLP_
IF /I "%~1"=="-H" GOTO :_A2UHLP_
 
IF NOT EXIST "!ASCIIFile!" (
	ECHO Error: file "!ASCIIFile!" not exist
	ENDLOCAL
	EXIT /B 1
)
TYPE "!ASCIIFile!" >NUL 2>&1 || (
	ECHO Error: could not read file "!ASCIIFile!"
	ENDLOCAL
	EXIT /B 1
)
 
IF /I "%~f0"=="%~f1" (
	ECHO Error: could not convert itself
	ENDLOCAL
	EXIT /B 1
)
 
SET UnicodeFile=%~f2
IF NOT DEFINED UnicodeFile SET UnicodeFile=%~f1
IF EXIST "!UnicodeFile!\" (
	ECHO Error: could not write to file "!UnicodeFile!"
	ENDLOCAL
	EXIT /B 1
)
 
IF /I "%~f0"=="%~f2" (
	ECHO Error: could not overwrite itself
	ENDLOCAL
	EXIT /B 1
)
 
Pushd "!TEMP!"
:_A2U_TMP
SET TempFile=_%random%_.t_
IF EXIST "!TempFile!" GOTO :_A2U_TMP
FOR /F "tokens=*" %%A IN ('CHCP') DO FOR %%B IN (%%A) DO SET CodePage=%%B
CHCP 1252 >NUL
CMD.EXE /D /A /C (SET/P=��)<NUL > "!TempFile!" 2>NUL
CHCP %CodePage% >NUL
CMD.EXE /D /U /C TYPE "!ASCIIFile!" >> "!TEMP!\!TempFile!"
Popd
 
COPY /B /Y /V "!TEMP!\!TempFile!" "!UnicodeFile!" >NUL 2>&1 || (
	DEL /F /Q /A "!TEMP!\!TempFile!" >NUL 2>&1
	ECHO Error: could not write to file "!UnicodeFile!"
	ENDLOCAL
	EXIT /B 1
)
DEL /F /Q /A "!TEMP!\!TempFile!" >NUL 2>&1
EXIT /B 0
 
:_A2UHLP_
ECHO %~nx0 : Convert ascii text file to unicode text file.
ECHO Usage: %~nx0 source.txt [destination.txt]
ECHO If you don't specify a destination %~nx0 will overwrite source.txt
ENDLOCAL
EXIT /B 1
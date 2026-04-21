@echo off
chcp 65001 >nul
echo ==========================================
echo    WMS APK 构建脚本
echo ==========================================
echo.

REM 检查环境
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Java，请安装 JDK 17 或更高版本
    exit /b 1
)

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 pnpm，请先安装: npm install -g pnpm
    exit /b 1
)

if "%ANDROID_HOME%"=="" (
    echo [警告] ANDROID_HOME 未设置
    echo 请设置 Android SDK 路径，或修改脚本中的 SDK 路径
    echo.
    echo 下载 Android SDK Command Line Tools:
    echo https://developer.android.com/studio#command-tools
    echo.
    pause
    exit /b 1
)

echo [1/5] 安装依赖...
call pnpm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    exit /b 1
)

echo [2/5] 构建 Mobile 应用...
cd apps/mobile
call pnpm build
if %errorlevel% neq 0 (
    echo [错误] Mobile 构建失败
    exit /b 1
)

echo [3/5] 同步 Capacitor Android...
call pnpm exec cap sync android
if %errorlevel% neq 0 (
    echo [错误] Capacitor 同步失败
    exit /b 1
)

echo [4/5] 构建 APK...
cd android
if exist gradlew.bat (
    call gradlew.bat assembleDebug
) else (
    call gradlew assembleDebug
)
if %errorlevel% neq 0 (
    echo [错误] APK 构建失败
    exit /b 1
)

echo [5/5] 复制 APK 到输出目录...
cd ..\..
if not exist "..\..\dist" mkdir "..\..\dist"
copy "android\app\build\outputs\apk\debug\app-debug.apk" "..\..\dist\WMS-v1.0.0-debug.apk"

echo.
echo ==========================================
echo    APK 构建成功!
echo ==========================================
echo.
echo 输出文件: dist\WMS-v1.0.0-debug.apk
echo.
pause

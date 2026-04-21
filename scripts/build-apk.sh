#!/bin/bash

set -e

echo "=========================================="
echo "   WMS APK 构建脚本"
echo "=========================================="
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}[错误] 未找到 $1${NC}"
        return 1
    fi
    return 0
}

echo "[检查] 检查构建环境..."

check_command java || {
    echo -e "${RED}请安装 JDK 17 或更高版本${NC}"
    exit 1
}

check_command pnpm || {
    echo -e "${RED}请先安装 pnpm: npm install -g pnpm${NC}"
    exit 1
}

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}[警告] ANDROID_HOME 未设置${NC}"
    echo "请设置 Android SDK 路径:"
    echo "  export ANDROID_HOME=/path/to/android-sdk"
    echo
    echo "下载 Android SDK Command Line Tools:"
    echo "https://developer.android.com/studio#command-tools"
    exit 1
fi

echo -e "${GREEN}[通过] 环境检查完成${NC}"
echo

# 步骤 1
echo "[1/5] 安装依赖..."
pnpm install

# 步骤 2
echo "[2/5] 构建 Mobile 应用..."
cd apps/mobile
pnpm build

# 步骤 3
echo "[3/5] 同步 Capacitor Android..."
pnpm exec cap sync android

# 步骤 4
echo "[4/5] 构建 APK..."
cd android
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew assembleDebug
else
    echo -e "${RED}[错误] 未找到 gradlew 文件${NC}"
    exit 1
fi

# 步骤 5
echo "[5/5] 复制 APK 到输出目录..."
cd ../..
mkdir -p ../../dist
cp android/app/build/outputs/apk/debug/app-debug.apk ../../dist/WMS-v1.0.0-debug.apk

echo
echo "=========================================="
echo -e "${GREEN}   APK 构建成功!${NC}"
echo "=========================================="
echo
echo "输出文件: dist/WMS-v1.0.0-debug.apk"
echo

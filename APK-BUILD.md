# WMS APK 构建指南

## 自动构建 (GitHub Actions)

项目已配置 GitHub Actions 工作流，每次推送到 main/master 分支时会自动构建 APK。

### 触发方式
1. **自动触发**: 推送到 `main` 或 `master` 分支
2. **手动触发**: 在 Actions 页面点击 "Run workflow"

### 下载 APK
- 构建完成后，APK 会作为 Artifact 上传
- 同时会创建一个 Release，包含 APK 文件

---

## 本地构建

### 环境要求

| 工具 | 版本 | 下载链接 |
|------|------|----------|
| Node.js | 20+ | https://nodejs.org/ |
| pnpm | 8+ | `npm install -g pnpm` |
| Java JDK | 17+ | https://adoptium.net/ |
| Android SDK | 最新 | https://developer.android.com/studio#command-tools |

### 环境变量配置

**Windows:**
```powershell
# 设置 ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")

# 添加到 PATH
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin", "User")
```

**Linux/macOS:**
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

### 构建步骤

#### 方式1: 使用脚本 (推荐)

**Windows:**
```cmd
scripts\build-apk.bat
```

**Linux/macOS:**
```bash
./scripts/build-apk.sh
```

#### 方式2: 手动构建

```bash
# 1. 安装依赖
pnpm install

# 2. 构建 Mobile 应用
cd apps/mobile
pnpm build

# 3. 同步 Capacitor (如果未添加平台)
pnpm exec cap add android

# 4. 同步到 Android 项目
pnpm exec cap sync android

# 5. 构建 APK
cd android
./gradlew assembleDebug

# 6. APK 输出位置
# apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 安装 APK

### 方式1: 直接安装
```bash
# 通过 ADB 安装
adb install -r app-debug.apk

# 或传输到手机后安装
```

### 方式2: 扫码下载
将 APK 上传到文件服务器，生成二维码扫描下载。

---

## 常见问题

### 1. Gradle 下载慢
在 `apps/mobile/android/gradle/wrapper/gradle-wrapper.properties` 中修改镜像源：
```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.5-all.zip
```

### 2. Android SDK 下载慢
配置国内镜像，在 `~/.android/repositories.cfg` 添加：
```
repo.maven.apache.org=maven.aliyun.com
```

### 3. 构建失败: SDK 位置未找到
确保 `ANDROID_HOME` 环境变量已设置，或在 `local.properties` 中添加：
```properties
sdk.dir=C:\Android\Sdk
```

### 4. Java 版本不兼容
确保使用 JDK 17 或更高版本：
```bash
java -version
```

---

## 发布版本

### 生成签名密钥
```bash
cd apps/mobile/android
keytool -genkey -v -keystore wms-release.keystore -alias wms -keyalg RSA -keysize 2048 -validity 10000
```

### 配置签名
在 `apps/mobile/capacitor.config.ts` 中添加：
```typescript
android: {
  buildOptions: {
    keystorePath: 'wms-release.keystore',
    keystoreAlias: 'wms',
    keystorePassword: 'your-password',
    keystoreAliasPassword: 'your-password'
  }
}
```

### 构建发布版本
```bash
cd apps/mobile/android
./gradlew assembleRelease
```

---

## 目录结构

```
.github/workflows/
  build-apk.yml          # GitHub Actions 配置
scripts/
  build-apk.bat          # Windows 构建脚本
  build-apk.sh           # Linux/macOS 构建脚本
apps/mobile/
  android/               # Android 原生项目
    app/build/outputs/apk/debug/
      app-debug.apk      # 生成的 APK 文件
```

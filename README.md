# WMS仓库管理系统

一个完整的仓库管理系统，支持网页端和APK移动端，实现实时数据同步。

## 功能特性

### 核心功能
- **用户认证**：登录/注册，操作员名字记录
- **首页仪表板**：数据分析、关键指标、图表展示
- **库存查询**：物料库存查询、多余库存查询
- **入库管理**：物料入库、多余库存入库
- **出库管理**：物料出库、多余库存出库
- **上下架记录**：入库上架、出库下架、库位转移、盘点调整
- **实时同步**：WebSocket实现多端实时数据同步

### 技术栈
- **前端**：Vue 3 + TypeScript + Vite
- **后端**：Node.js + Express + MySQL
- **移动端**：Vue 3 + Capacitor 打包成APK
- **实时通信**：WebSocket (Socket.io)

## 项目结构

```
wms-system/
├── apps/
│   ├── web/                    # 网页端 (Vue 3 + Element Plus)
│   └── mobile/                 # 移动端 (Vue 3 + Capacitor)
├── server/                     # 后端服务 (Node.js + Express)
├── database/                   # 数据库脚本
└── docker-compose.yml          # Docker编排
```

## 快速开始

### 环境要求
- Node.js >= 18
- MySQL >= 8.0
- pnpm >= 9.0

### 安装依赖

```bash
# 安装pnpm
npm install -g pnpm

# 安装依赖
pnpm install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑 .env 文件，配置数据库连接等
```

### 启动开发环境

```bash
# 启动MySQL（使用Docker）
docker-compose up -d mysql

# 启动后端服务
pnpm server:dev

# 启动网页端
pnpm web:dev

# 启动移动端
pnpm mobile:dev
```

### 数据库初始化

```bash
# 执行数据库迁移
pnpm db:migrate
```

### 构建生产环境

```bash
# 构建所有项目
pnpm build

# 使用Docker Compose部署
docker-compose up -d
```

### 构建APK

```bash
# 构建移动端
pnpm mobile:build

# 构建Android APK
cd apps/mobile/android
./gradlew assembleDebug
```

## API文档

### 认证接口
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/auth/profile` - 获取用户信息

### 库存接口
- `GET /api/v1/inventory/materials` - 物料库存列表
- `GET /api/v1/inventory/excess` - 多余库存列表
- `POST /api/v1/inventory/materials` - 创建物料

### 入库接口
- `GET /api/v1/inbound` - 入库记录列表
- `POST /api/v1/inbound/material` - 物料入库
- `POST /api/v1/inbound/excess` - 多余库存入库

### 出库接口
- `GET /api/v1/outbound` - 出库记录列表
- `POST /api/v1/outbound/material` - 物料出库
- `POST /api/v1/outbound/excess` - 多余库存出库

### 上下架接口
- `GET /api/v1/shelf` - 上下架记录列表
- `POST /api/v1/shelf/up` - 上架操作
- `POST /api/v1/shelf/down` - 下架操作
- `POST /api/v1/shelf/transfer` - 库位转移
- `POST /api/v1/shelf/adjust` - 盘点调整

### 仪表板接口
- `GET /api/v1/dashboard/stats` - 统计数据
- `GET /api/v1/dashboard/charts` - 图表数据
- `GET /api/v1/dashboard/alerts` - 库存预警
- `GET /api/v1/dashboard/activities` - 最近活动

## WebSocket事件

### 客户端发送
- `auth:login` - 连接认证
- `inventory:subscribe` - 订阅库存更新
- `inventory:unsubscribe` - 取消订阅
- `dashboard:subscribe` - 订阅仪表板

### 服务器推送
- `inventory:updated` - 库存更新通知
- `shelf:changed` - 上下架变更通知
- `transaction:new` - 新交易记录通知
- `system:notification` - 系统通知

## 界面设计

### 网页端
- 左侧菜单栏导航
- 硅胶质感按钮设计
- 响应式布局
- 数据可视化图表

### 移动端
- 九宫格功能菜单
- 底部Tab导航
- 卡片式布局
- 手势操作支持

## 数据库表结构

### 核心表
- `users` - 用户表
- `materials` - 物料基础表
- `material_stock` - 物料库存表
- `excess_stock` - 多余库存表
- `inbound_records` - 入库记录表
- `outbound_records` - 出库记录表
- `shelf_records` - 上下架记录表
- `operation_logs` - 操作日志表

## 开发规范

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 使用Prettier进行代码格式化

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或Pull Request。

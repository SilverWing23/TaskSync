# TaskSync

企业级团队项目任务管理Web系统，支持多人协作、权限分级、项目全生命周期管理。

## 功能特性

### 账号权限模块
- 用户注册、登录、退出、个人信息编辑、头像修改
- 权限分级：超级管理员、项目管理员、普通成员、只读成员
- 团队创建、成员邀请、成员移除、角色权限自定义配置

### 项目管理模块
- 创建项目、编辑项目、归档项目、删除项目
- 项目基础信息：名称、简介、起止时间、负责人、所属团队、标签、优先级
- 项目视图：列表视图、看板视图、日历视图、甘特图视图
- 项目汇总：整体进度、任务统计、成员工作量统计

### 任务管理模块
- 新建任务、子任务、批量新建、批量编辑、批量删除
- 完整字段：标题、描述、负责人、参与人、截止时间、优先级、状态、工时预估等
- 拖拽修改状态、拖拽排序、快捷改截止时间、任务复制、任务归档
- 自动记录任务变更日志，支持团队成员评论

### 看板视图模块
- 自定义看板列（待处理、进行中、待验收、已完成等）
- 支持拖拽任务跨列移动、自动更新任务状态
- 看板列可新增、删除、重命名、排序

### 数据统计仪表盘
- 首页数据大盘：项目总数、进行中项目、逾期任务、今日待办统计
- 可视化图表：进度折线图、成员工作量柱状图、任务状态饼图
- 支持数据筛选、时间筛选

### 消息通知模块
- 任务指派、截止提醒、评论回复、状态变更实时通知
- 系统消息中心、未读消息红点提醒

## 技术栈

- **前端**: Vue3 + Vite + Element Plus + Pinia + Axios
- **后端**: Node.js + Express
- **数据库**: MySQL

## 快速开始

### 环境要求

- Node.js >= 18.x
- MySQL >= 5.7
- npm >= 9.x

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd team-task-manager
```

#### 2. 数据库配置

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE task_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入初始化数据
USE task_manager;
source database/init.sql;
```

#### 3. 后端配置

```bash
cd backend
npm install
```

修改 `backend/.env` 文件：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
JWT_SECRET=your_jwt_secret_key_here_must_be_long_and_secure
UPLOAD_PATH=./uploads
```

启动后端服务：

```bash
npm run dev
```

#### 4. 前端配置

```bash
cd frontend
npm install
```

启动前端开发服务器：

```bash
npm run dev
```

#### 5. 访问系统

打开浏览器访问 `http://localhost:5173`

### 演示账号

- **管理员**: admin@example.com / 123456
- **用户1**: user1@example.com / 123456
- **用户2**: user2@example.com / 123456
- **用户3**: user3@example.com / 123456

## 项目结构

```
team-task-manager/
├── backend/                    # 后端代码
│   ├── config/                # 配置文件
│   ├── controllers/           # 控制器
│   ├── middleware/            # 中间件
│   ├── models/                # 数据模型
│   ├── routes/                # 路由定义
│   ├── utils/                 # 工具函数
│   ├── app.js                 # 应用入口
│   └── package.json
├── frontend/                  # 前端代码
│   ├── src/
│   │   ├── components/        # 组件
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # Pinia状态管理
│   │   ├── utils/             # 工具函数
│   │   ├── views/             # 页面视图
│   │   ├── App.vue            # 根组件
│   │   └── main.js            # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/                  # 数据库脚本
│   └── init.sql               # 初始化脚本
└── README.md
```

## API接口

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 修改密码

### 项目接口
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 任务接口
- `GET /api/tasks/project/:projectId` - 获取项目任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 团队接口
- `GET /api/teams` - 获取团队列表
- `POST /api/teams` - 创建团队
- `POST /api/teams/:id/members` - 添加成员

### 看板接口
- `GET /api/kanban/project/:projectId` - 获取看板列
- `PUT /api/kanban/move-task` - 移动任务

### 通知接口
- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/read-all` - 全部标为已读

## 数据库表结构

| 表名 | 说明 |
|------|------|
| users | 用户信息表 |
| teams | 团队信息表 |
| team_members | 团队成员关系表 |
| projects | 项目信息表 |
| project_members | 项目成员关系表 |
| tasks | 任务信息表 |
| task_groups | 任务分组表 |
| task_comments | 任务评论表 |
| task_changes | 任务变更记录表 |
| task_attachments | 任务附件表 |
| notifications | 通知信息表 |
| kanban_columns | 看板列表 |

## 开发说明

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 变量命名采用 camelCase
- 函数命名采用 camelCase
- 组件命名采用 PascalCase

### 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 代码重构
- test: 测试更新

## License

MIT License
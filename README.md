# 餐厅菜单设计器

餐厅菜单设计器是一款纯前端可视化菜单排版工具，支持菜品管理、分类管理、模板套用、拖拽排版、全屏预览和 PNG 导出，所有数据保存在浏览器 localStorage 中。

## Docker Compose 快速启动

首次启动前先复制环境变量文件：

```bash
cp .env.example .env
docker compose up -d
```

访问地址：

```text
http://localhost:28607
```

查看运行状态：

```bash
docker compose ps
```

停止服务：

```bash
docker compose down
```

## 主要功能

- 设计器主页面：左侧菜品素材、中间 A4 菜单画布、右侧属性面板。
- 菜品管理：卡片/表格双视图、创建、编辑、删除、搜索、分类筛选、价格排序、图片上传转 Data URL。
- 分类管理：创建、编辑、删除、关联菜品统计、拖拽排序。
- 模板画廊：经典单栏、双栏现代、卡片式三种模板，支持自定义配色、字体和标题。
- 全屏预览：模拟打印纸张，支持缩放、亮暗背景、打印和 PNG 导出。
- 横切能力：主题切换、RxJS BehaviorSubject 状态、Undo/Redo、自研拖拽和调整大小指令。

## 本地开发

```bash
cd frontend
npm install
npm start
```

本地开发服务器固定端口：

```text
http://localhost:28607
```

构建与类型检查：

```bash
npm run build
npm run typecheck
```

## 技术栈

| 类型 | 技术 |
| --- | --- |
| 框架 | Angular 18 |
| 语言 | TypeScript |
| 状态流 | RxJS BehaviorSubject / Observable |
| 构建 | Angular CLI / Vite 开发服务器 |
| 样式 | Tailwind CSS + CSS 变量 |
| 导出 | html2canvas |
| 持久化 | localStorage |
| 部署 | Docker Compose + Nginx |

## 项目目录结构

```text
wje-107/
├── docker-compose.yml
├── .env.example
├── README.md
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── angular.json
    ├── package.json
    └── src/
        ├── app/
        │   ├── components/
        │   ├── directives/
        │   ├── guards/
        │   ├── models/
        │   ├── pages/
        │   ├── pipes/
        │   └── services/
        ├── assets/
        ├── environments/
        └── styles/
```

## 核心功能截图说明

运行项目后可在浏览器查看以下界面：

- `/designer`：菜单画布、素材面板、属性编辑面板。
- `/menu`：菜品卡片和表格管理视图。
- `/categories`：分类列表、统计和拖拽排序。
- `/templates`：模板缩略预览和样式编辑。
- `/preview`：全屏打印效果预览与导出。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `COMPOSE_PROJECT_NAME` | `wjemenudesigner` | Compose 项目名，避免中文目录名影响容器命名 |
| `FRONTEND_PORT` | `28607` | 宿主机访问端口 |

## Docker 部署说明

`docker-compose.yml` 使用 Compose V2 格式，不包含 `version` 字段，并声明 `name: wjemenudesigner`。前端容器使用多阶段构建，Node 阶段构建 Angular 静态文件，Nginx 阶段托管构建产物并处理 SPA 路由回退。

常见问题：

- 端口被占用：修改 `.env` 中的 `FRONTEND_PORT` 后重新执行 `docker compose up -d`。
- 页面刷新 404：Nginx 已配置 `try_files` 回退到 `index.html`，请确认使用的是本项目镜像。
- 数据丢失：本项目仅使用当前浏览器 localStorage，不会同步到其他浏览器或设备。

## License

MIT

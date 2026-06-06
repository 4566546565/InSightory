# InSightory

高中历史学习平台。项目使用 Next.js、Prisma 和 PostgreSQL。

## 协作者快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例环境变量文件：

```bash
cp .env.example .env
```

Windows PowerShell 可以使用：

```powershell
Copy-Item .env.example .env
```

然后打开 `.env`，把数据库地址中的 `[YOUR-DB-PASSWORD]` 替换成真实数据库密码：

```env
DATABASE_URL="postgresql://insightory:[YOUR-DB-PASSWORD]@47.106.161.218:5432/insightory"
DIRECT_URL="postgresql://insightory:[YOUR-DB-PASSWORD]@47.106.161.218:5432/insightory"
```

替换后类似：

```env
DATABASE_URL="postgresql://insightory:your_password_here@47.106.161.218:5432/insightory"
DIRECT_URL="postgresql://insightory:your_password_here@47.106.161.218:5432/insightory"
```

不要把真实 `.env` 提交到 GitHub。真实数据库密码请向项目维护者获取。

### 3. 生成 Prisma Client

```bash
npx prisma generate
```

### 4. 启动本地开发服务

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

教材、知识点、题目、地图和知识扩充候选等数据会通过 `.env` 中的 `DATABASE_URL` 从 PostgreSQL 读取。

## 如何确认数据库已经连通

### 方法一：打开 Prisma Studio

```bash
npx prisma studio
```

浏览器会打开数据库可视化页面，可以查看各表数据。

### 方法二：命令行读取知识点数量

```bash
npx tsx -e "import { db } from './src/lib/db'; console.log(await db.knowledgePoint.count()); process.exit(0)"
```

如果能输出数字，说明数据库连接成功。

### 方法三：访问应用页面

启动 `npm run dev` 后访问：

```text
http://localhost:3000/knowledge
http://localhost:3000/sources/knowledge-expansion
```

如果页面能展示数据或进入登录流程，说明应用已经读取到数据库或后端服务正常工作。

## 注意事项

- `.env` 包含数据库密码和 API Key，不能提交到 GitHub。
- `DATABASE_URL` 和 `DIRECT_URL` 都需要配置。
- 如果数据库密码变更，协作者需要同步更新本地 `.env`。
- 如果只是开发 UI，不建议直接操作生产数据库；可以让维护者提供只读账号或开发数据库。

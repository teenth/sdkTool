# @syc/sdk-tool

Baidu Cloud SDK with R2 storage support - 一个用于 Cloudflare R2 存储的 TypeScript SDK

## 安装

```bash
npm install @syc/sdk-tool
```

## 快速开始

### 基础用法

```typescript
import { createR2Client } from "@syc/sdk-tool";

// 创建 R2 客户端
const r2 = createR2Client({
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "your-bucket-name",
});

// 上传文件
const fileBuffer = Buffer.from("Hello World");
const result = await r2.upload("test.txt", fileBuffer, {
  contentType: "text/plain",
});
console.log("Upload result:", result);
```

### 使用环境变量

```typescript
import { createR2ClientFromEnv, createR2Client } from "@syc/sdk-tool";

// 方式1: 直接从环境变量创建配置
const config = createR2ClientFromEnv();
const r2 = createR2Client(config);

// 环境变量设置
// R2_ACCOUNT_ID=your-account-id
// R2_ACCESS_KEY_ID=your-access-key
// R2_SECRET_ACCESS_KEY=your-secret-key
// R2_BUCKET=your-bucket-name
// R2_REGION=auto (可选)
```

### 完整示例

```typescript
import {
  createR2Client,
  getMimeType,
  generateUniqueFileName,
} from "@syc/sdk-tool";

const r2 = createR2Client({
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "your-bucket-name",
});

// 上传文件
const fileBuffer = Buffer.from("Hello World");
const uniqueFileName = generateUniqueFileName("test.txt", "uploads");
const mimeType = getMimeType(uniqueFileName);

const uploadResult = await r2.upload(uniqueFileName, fileBuffer, {
  contentType: mimeType,
});

console.log("文件上传成功:", uploadResult);

// 获取文件
const fileContent = await r2.get(uniqueFileName);

// 检查文件是否存在
const exists = await r2.exists(uniqueFileName);
console.log("文件是否存在:", exists);

// 获取预签名URL
const signedUrl = await r2.getSignedUrl(uniqueFileName, 3600);
console.log("预签名URL:", signedUrl);

// 列出文件
const files = await r2.list("uploads/", 10);
console.log("文件列表:", files);

// 删除文件
await r2.delete(uniqueFileName);
```

## API 文档

### 类型定义

#### R2Config

```typescript
interface R2Config {
  accountId: string; // Cloudflare 账户ID
  accessKeyId: string; // R2 访问密钥ID
  secretAccessKey: string; // R2 访问密钥
  bucket: string; // 存储桶名称
  region?: string; // 区域，默认为 'auto'
  endpoint?: string; // 自定义端点
}
```

#### UploadOptions

```typescript
interface UploadOptions {
  contentType?: string; // 文件MIME类型
  expiresIn?: number; // 过期时间（秒）
}
```

#### UploadResult

```typescript
interface UploadResult {
  url: string; // 文件访问URL
  fileName: string; // 文件名
  size: number; // 文件大小（字节）
}
```

### 主要函数

#### createR2Client(config: R2Config)

创建 R2 存储客户端

```typescript
const r2 = createR2Client({
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "your-bucket-name",
});
```

#### createR2ClientFromEnv()

从环境变量创建 R2 配置

```typescript
const config = createR2ClientFromEnv();
const r2 = createR2Client(config);
```

### R2 客户端方法

#### upload(fileName: string, data: Buffer, options?: UploadOptions)

上传文件

```typescript
const result = await r2.upload("test.txt", fileBuffer, {
  contentType: "text/plain",
});
```

#### get(fileName: string)

获取文件内容

```typescript
const fileContent = await r2.get("test.txt");
```

#### delete(fileName: string)

删除文件

```typescript
await r2.delete("test.txt");
```

#### list(prefix?: string, maxKeys?: number)

列出文件（默认最多返回1000个文件）

```typescript
const files = await r2.list("uploads/", 100);
```

#### getSignedUrl(fileName: string, expiresIn?: number)

获取预签名URL（默认1小时有效）

```typescript
const url = await r2.getSignedUrl("test.txt", 3600);
```

#### exists(fileName: string)

检查文件是否存在

```typescript
const exists = await r2.exists("test.txt");
```

### 工具函数

#### getMimeType(fileName: string)

根据文件扩展名获取MIME类型

```typescript
const mimeType = getMimeType("test.jpg"); // 'image/jpeg'
```

支持的文件类型：

- 图片：jpg, jpeg, png, gif, webp, svg
- 文档：pdf, txt, json, xml, html, css, js
- 压缩：zip, rar
- 音视频：mp4, mp3, wav

#### generateUniqueFileName(originalName: string, prefix?: string)

生成唯一文件名

```typescript
const uniqueName = generateUniqueFileName("test.txt", "uploads");
// 输出: uploads_test_1640995200000_abc123def.txt
```

## 错误处理

所有方法都会抛出错误，建议使用 try-catch 处理：

```typescript
try {
  const result = await r2.upload("test.txt", fileBuffer);
  console.log("上传成功:", result);
} catch (error) {
  console.error("上传失败:", error);
}
```

## 环境变量配置

创建 `.env` 文件：

```bash
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=your-bucket-name
R2_REGION=auto
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### 1.0.0

- 初始版本
- 支持 Cloudflare R2 存储
- 提供完整的文件操作 API
- 包含实用工具函数

# R2 Storage SDK - 第三方链接迁移功能

新增了 `migrateUrl` 方法，可以将任何第三方链接的文件迁移到你的 CDN。

## 🆕 新功能：第三方链接迁移

### 基本使用

```javascript
const { createR2Storage } = require("./src/r2-storage");

const r2Storage = createR2Storage({
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "your-bucket",
  cdnDomain: "https://cdn.example.com",
});

// 自动迁移，文件名会自动生成
const result = await r2Storage.migrateUrl("https://example.com/image.jpg");
console.log(result.url); // https://cdn.example.com/file_1640995200000_abc123.jpg
```

### 自定义文件名

```javascript
const result = await r2Storage.migrateUrl("https://example.com/image.jpg", {
  fileName: "my-custom-image.jpg",
});
console.log(result.url); // https://cdn.example.com/my-custom-image.jpg
```

### 批量迁移

```javascript
const urls = [
  "https://example.com/image1.jpg",
  "https://example.com/image2.png",
  "https://example.com/image3.gif",
];

const results = await Promise.all(urls.map((url) => r2Storage.migrateUrl(url)));

console.log("批量迁移完成！");
results.forEach((result, index) => {
  console.log(`${index + 1}. ${result.url}`);
});
```

## 特性

- ✅ 自动文件名生成
- ✅ 自动内容类型检测
- ✅ 从 URL 路径提取文件名
- ✅ 支持自定义文件名
- ✅ 支持批量迁移
- ✅ 完整的错误处理

## 运行示例

```bash
node example-migrate-url.js
```

## 环境要求

- Node.js 18+ (支持内置 fetch) 或安装 node-fetch
- 浏览器环境需要支持 fetch API

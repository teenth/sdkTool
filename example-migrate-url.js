const { createR2Storage } = require("./src/r2-storage");

// 配置 R2 存储
const config = {
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "your-bucket",
  cdnDomain: "https://cdn.example.com", // 你的 CDN 域名
};

const r2Storage = createR2Storage(config);

async function migrateUrlExample() {
  try {
    // 示例 1: 基本的 URL 迁移
    console.log("正在迁移图片...");
    const result1 = await r2Storage.migrateUrl(
      "https://example.com/some-image.jpg"
    );
    console.log("迁移成功！新地址:", result1.url);
    console.log("文件名:", result1.fileName);
    console.log("文件大小:", result1.size, "bytes");

    // 示例 2: 自定义文件名迁移
    console.log("\n正在使用自定义文件名迁移...");
    const result2 = await r2Storage.migrateUrl(
      "https://example.com/another-image.png",
      {
        fileName: "my-custom-image.png",
      }
    );
    console.log("迁移成功！新地址:", result2.url);

    // 示例 3: 指定内容类型
    console.log("\n正在使用自定义内容类型迁移...");
    const result3 = await r2Storage.migrateUrl(
      "https://example.com/document.pdf",
      {
        fileName: "important-document.pdf",
        contentType: "application/pdf",
      }
    );
    console.log("迁移成功！新地址:", result3.url);

    // 示例 4: 批量迁移
    console.log("\n正在批量迁移...");
    const urls = [
      "https://example.com/image1.jpg",
      "https://example.com/image2.png",
      "https://example.com/image3.gif",
    ];

    const results = await Promise.all(
      urls.map((url) => r2Storage.migrateUrl(url))
    );

    console.log("批量迁移完成！");
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url}`);
    });
  } catch (error) {
    console.error("迁移失败:", error.message);
  }
}

// 运行示例
migrateUrlExample();

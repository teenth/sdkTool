const express = require("express");
const path = require("path");
const {
  createR2Client,
  generateUniqueFileName,
  getMimeType,
} = require("../dist/index");
require("dotenv").config();

const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 创建R2客户端
const r2 = createR2Client();

// 文件上传配置
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
  expiresIn: 3600, // 1小时
};

// 获取预签名上传URL
app.post("/api/upload/presigned", async (req, res) => {
  try {
    const { fileName, contentType, fileSize } = req.body;

    // 验证请求参数
    if (!fileName || !contentType || !fileSize) {
      return res.status(400).json({
        error: "缺少必要参数：fileName, contentType, fileSize",
      });
    }

    // 验证文件大小
    if (fileSize > UPLOAD_CONFIG.maxFileSize) {
      return res.status(400).json({
        error: `文件大小超过限制，最大允许 ${
          UPLOAD_CONFIG.maxFileSize / 1024 / 1024
        }MB`,
      });
    }

    // 验证文件类型
    if (!UPLOAD_CONFIG.allowedTypes.includes(contentType)) {
      return res.status(400).json({
        error: `不支持的文件类型，支持的类型：${UPLOAD_CONFIG.allowedTypes.join(
          ", "
        )}`,
      });
    }

    // 生成唯一文件名
    const uniqueFileName = generateUniqueFileName(fileName, "uploads");

    // 生成预签名上传URL
    const uploadUrl = await r2.getSignedUploadUrl(
      uniqueFileName,
      contentType,
      UPLOAD_CONFIG.expiresIn
    );

    console.log(`Generated upload URL for: ${uniqueFileName}`);

    res.json({
      uploadUrl,
      fileName: uniqueFileName,
      expiresIn: UPLOAD_CONFIG.expiresIn,
      success: true,
    });
  } catch (error) {
    console.error("生成预签名URL失败:", error);
    res.status(500).json({
      error: "生成上传URL失败：" + error.message,
    });
  }
});

// 上传完成通知（可选）
app.post("/api/upload/complete", async (req, res) => {
  try {
    const { fileName } = req.body;

    // 验证文件是否存在
    const exists = await r2.exists(fileName);
    if (!exists) {
      return res.status(404).json({
        error: "文件不存在",
      });
    }

    // 这里可以添加业务逻辑，如保存文件信息到数据库
    console.log(`文件上传完成: ${fileName}`);

    // 生成文件访问URL
    const fileUrl = await r2.getSignedUrl(fileName, 3600);

    res.json({
      success: true,
      fileName,
      fileUrl,
      message: "文件上传成功",
    });
  } catch (error) {
    console.error("处理上传完成通知失败:", error);
    res.status(500).json({
      error: "处理上传完成通知失败：" + error.message,
    });
  }
});

// 获取文件列表
app.get("/api/files", async (req, res) => {
  try {
    const { prefix = "uploads/", maxKeys = 50 } = req.query;
    const files = await r2.list(prefix, parseInt(maxKeys));

    res.json({
      success: true,
      files: files.map((file) => ({
        name: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
      })),
    });
  } catch (error) {
    console.error("获取文件列表失败:", error);
    res.status(500).json({
      error: "获取文件列表失败：" + error.message,
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${port}`);
  console.log(`📁 请确保在 .env 文件中配置了 R2 相关环境变量`);
});

module.exports = app;

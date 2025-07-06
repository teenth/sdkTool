/*
 * Cloudflare R2 Storage SDK
 *
 * 使用示例：
 *
 * // 配置 CDN 域名 (推荐)
 * const config = {
 *   accountId: "your-account-id",
 *   accessKeyId: "your-access-key",
 *   secretAccessKey: "your-secret-key",
 *   bucket: "your-bucket",
 *   cdnDomain: "https://cdn.example.com" // 自定义域名
 * };
 *
 * // 或使用 R2 的公共 URL (需要在 Cloudflare 控制台配置)
 * const config = {
 *   accountId: "your-account-id",
 *   accessKeyId: "your-access-key",
 *   secretAccessKey: "your-secret-key",
 *   bucket: "your-bucket",
 *   cdnDomain: "https://pub-xxxxx.r2.dev" // R2 公共域名
 * };
 *
 * const r2Storage = createR2Storage(config);
 *
 * // 上传文件，会返回完整的 CDN 地址
 * const result = await r2Storage.upload("image.jpg", file);
 * console.log(result.url); // https://cdn.example.com/image.jpg
 *
 * // 将第三方链接迁移到你的 CDN
 * const migrateResult = await r2Storage.migrateUrl("https://example.com/image.jpg");
 * console.log(migrateResult.url); // https://cdn.example.com/file_1640995200000_abc123.jpg
 *
 * // 自定义文件名迁移
 * const customResult = await r2Storage.migrateUrl("https://example.com/image.jpg", {
 *   fileName: "my-custom-image.jpg"
 * });
 * console.log(customResult.url); // https://cdn.example.com/my-custom-image.jpg
 */

import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as path from "path";

// 兼容 Node.js 和浏览器环境的 File 类型定义
interface FileInterface {
  arrayBuffer(): Promise<ArrayBuffer>;
  type: string;
  name: string;
  size: number;
}

// 在 Node.js 环境中，File 可能不存在，所以使用联合类型
declare global {
  interface File extends FileInterface {}

  // 声明 fetch 为全局变量，兼容 Node.js 18+ 和浏览器环境
  var fetch: any;
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  endpoint?: string;
  cdnDomain?: string; // CDN 域名，如 https://cdn.example.com 或 https://pub-xxxxx.r2.dev
}

export interface UploadOptions {
  contentType?: string;
  expiresIn?: number;
}

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

// 支持多种文件类型
export type FileInput =
  | FileInterface
  | Buffer
  | string
  | Uint8Array
  | ArrayBuffer;

export interface MigrateUrlOptions {
  fileName?: string; // 自定义文件名，如不提供则自动生成
  contentType?: string; // 自定义内容类型
  expiresIn?: number;
}

export interface R2StorageInstance {
  get: (fileName: string) => Promise<any>;
  upload: (
    fileName: string,
    data: FileInput,
    options?: UploadOptions
  ) => Promise<UploadResult>;
  delete: (fileName: string) => Promise<void>;
  list: (prefix?: string, maxKeys?: number) => Promise<any[]>;
  getSignedUrl: (fileName: string, expiresIn?: number) => Promise<string>;
  exists: (fileName: string) => Promise<boolean>;
  migrateUrl: (
    url: string,
    options?: MigrateUrlOptions
  ) => Promise<UploadResult>;
}

// 文件类型转换工具函数
async function convertToBuffer(data: FileInput): Promise<Buffer> {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (typeof data === "string") {
    // 如果是字符串，假设它是文件路径
    if (typeof fs !== "undefined" && fs.existsSync && fs.existsSync(data)) {
      return fs.readFileSync(data);
    }
    // 否则当作文本内容
    return Buffer.from(data, "utf-8");
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  if (data && typeof data === "object" && "arrayBuffer" in data) {
    // 浏览器环境下的 File 对象
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("Unsupported file type");
}

// 自动检测文件类型
function detectContentType(fileName: string, data: FileInput): string {
  // 如果是 File 对象，直接使用其 type
  if (data && typeof data === "object" && "type" in data && data.type) {
    return data.type;
  }

  // 根据文件扩展名推断
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".xml": "application/xml",
    ".zip": "application/zip",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

// 从 Content-Type 获取文件扩展名
function getExtensionFromContentType(contentType: string): string {
  const typeToExtension: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
    "application/json": ".json",
    "application/xml": ".xml",
    "application/zip": ".zip",
    "video/mp4": ".mp4",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
  };

  // 去掉参数部分，如 "image/jpeg; charset=utf-8" -> "image/jpeg"
  const cleanContentType = contentType.split(";")[0].trim();
  return typeToExtension[cleanContentType] || "";
}

// 生成随机文件名
function generateRandomFileName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `file_${timestamp}_${random}`;
}

// 兼容 Node.js 和浏览器环境的 fetch
async function universalFetch(url: string): Promise<any> {
  // 使用全局 fetch，如果不存在则抛出错误
  if (typeof fetch === "undefined") {
    throw new Error(
      "Fetch is not available. Please install node-fetch or use Node.js 18+"
    );
  }

  return fetch(url);
}

export function createR2Storage(config: R2Config): R2StorageInstance {
  const client = new S3Client({
    region: config.region || "auto",
    endpoint:
      config.endpoint || `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const get = async (fileName: string): Promise<any> => {
    try {
      const file = await client.send(
        new GetObjectCommand({
          Bucket: config.bucket,
          Key: fileName,
        })
      );

      if (!file.Body) {
        throw new Error("File not found");
      }

      return file.Body;
    } catch (error) {
      console.error("[R2Storage] Get file error:", error);
      throw error;
    }
  };

  const upload = async (
    fileName: string,
    data: FileInput,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      // 自动转换为 Buffer
      const buffer = await convertToBuffer(data);

      // 自动检测内容类型
      const contentType =
        options.contentType || detectContentType(fileName, data);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
      });

      await client.send(command);

      // 生成完整的 CDN 地址
      let cdnUrl: string;
      if (config.cdnDomain) {
        // 使用自定义 CDN 域名
        cdnUrl = `${config.cdnDomain.replace(/\/$/, "")}/${fileName}`;
      } else {
        // 如果没有配置 CDN 域名，使用 R2 的默认公共 URL
        // 注意：需要先在 Cloudflare 控制台中为 bucket 配置自定义域名或公共访问
        console.warn(
          "[R2Storage] No CDN domain configured, using bucket endpoint"
        );
        cdnUrl = `${
          config.endpoint ||
          `https://${config.accountId}.r2.cloudflarestorage.com`
        }/${config.bucket}/${fileName}`;
      }

      return {
        url: cdnUrl,
        fileName,
        size: buffer.length,
      };
    } catch (error) {
      console.error("[R2Storage] Upload error:", error);
      throw error;
    }
  };

  const deleteFile = async (fileName: string): Promise<void> => {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: fileName,
        })
      );
    } catch (error) {
      console.error("[R2Storage] Delete file error:", error);
      throw error;
    }
  };

  const list = async (prefix?: string, maxKeys: number = 1000) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await client.send(command);
      return response.Contents || [];
    } catch (error) {
      console.error("[R2Storage] List files error:", error);
      throw error;
    }
  };

  const getSignedUrl = async (
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> => {
    try {
      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: fileName,
      });

      return await getS3SignedUrl(client, command, { expiresIn });
    } catch (error) {
      console.error("[R2Storage] Get signed URL error:", error);
      throw error;
    }
  };

  const exists = async (fileName: string): Promise<boolean> => {
    try {
      await client.send(
        new GetObjectCommand({
          Bucket: config.bucket,
          Key: fileName,
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const migrateUrl = async (
    url: string,
    options: MigrateUrlOptions = {}
  ): Promise<UploadResult> => {
    try {
      // 从 URL 下载文件
      const response = await universalFetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch URL: ${response.status} ${response.statusText}`
        );
      }

      // 获取文件内容
      const arrayBuffer = await response.arrayBuffer();

      // 自动生成文件名或使用提供的文件名
      let fileName = options.fileName;
      if (!fileName) {
        // 从 URL 提取文件名
        const urlPath = new URL(url).pathname;
        const extractedName = path.basename(urlPath);

        // 如果 URL 没有文件扩展名，则从 Content-Type 推断
        if (!path.extname(extractedName)) {
          const contentType =
            response.headers.get("content-type") || "application/octet-stream";
          const extension = getExtensionFromContentType(contentType);
          fileName = `${extractedName || generateRandomFileName()}${extension}`;
        } else {
          fileName = extractedName || generateRandomFileName();
        }
      }

      // 使用检测到的或提供的内容类型
      const contentType =
        options.contentType ||
        response.headers.get("content-type") ||
        detectContentType(fileName, arrayBuffer);

      // 上传到 R2
      const result = await upload(fileName, arrayBuffer, {
        contentType,
        expiresIn: options.expiresIn,
      });

      return result;
    } catch (error) {
      console.error("[R2Storage] Migrate URL error:", error);
      throw error;
    }
  };

  return {
    get,
    upload,
    delete: deleteFile,
    list,
    getSignedUrl,
    exists,
    migrateUrl,
  };
}

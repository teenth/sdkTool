// 核心功能模块 - 所有环境通用
// 导出请求相关的函数
export { get, post } from "./request";

// 版本信息
export const VERSION = "1.0.0";

// 浏览器安全的工具函数 - 直接在这里实现，避免引用 utils.ts
export function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    txt: "text/plain",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

export function generateUniqueFileName(
  originalName: string,
  prefix: string = ""
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");

  return `${prefix}${
    prefix ? "_" : ""
  }${baseName}_${timestamp}_${random}.${ext}`;
}

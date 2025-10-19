// Node.js 环境完整版本
import {
  createR2Storage,
  R2Config,
  R2StorageInstance,
} from "./r2-storage";
// 导出核心功能
export * from "./core";

// 导出chat相关的函数
export {
  grsaiChat,
  tuziFlux,
  replicateFlux,
  kieChat,
  handleChatCallback,
  grsaiStatus,
  flux,
  grsaiNanoBananaChat,
} from "./chat";

// 导出R2存储相关的类和接口
export {
  createR2Storage,
  R2Config,
  UploadOptions,
  UploadResult,
  R2StorageInstance,
} from "./r2-storage";

// 导出React组件
export * from "./react";

export function createR2Client(
  config: R2Config = {} as R2Config
): R2StorageInstance {
  const options = {
    ...createR2ClientFromEnv(),
    ...config,
  };
  return createR2Storage(options);
}

function createR2ClientFromEnv(): R2Config {
  const config: R2Config = {
    accountId: process.env.R2_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucket: process.env.R2_BUCKET || "",
    region: process.env.R2_REGION,
    cdnDomain: process.env.R2_CDN_DOMAIN,
  };

  if (
    !config.accountId ||
    !config.accessKeyId ||
    !config.secretAccessKey ||
    !config.bucket
  ) {
    throw new Error(
      "Missing required R2 configuration in environment variables"
    );
  }

  return config;
}

// 默认导出
export default {
  VERSION: "1.0.0",
};

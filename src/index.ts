// 导出R2存储相关的类和接口
export {
  type R2Config,
  type UploadOptions,
  type UploadResult,
} from "./r2-storage";

// 导出便捷函数
export { createR2Client, createR2ClientFromEnv, getMimeType, generateUniqueFileName } from "./utils";

// 版本信息
export const VERSION = "1.0.0";

// 默认导出
import * as R2Storage from "./r2-storage";
export default {
  R2Storage,
  VERSION,
};

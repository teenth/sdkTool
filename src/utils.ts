import { createR2Storage, R2Config, R2StorageInstance } from "./r2-storage";

export function createR2Client(config: R2Config = {} as R2Config): R2StorageInstance {
  const options = {
    ...createR2ClientFromEnv(),
    ...config,
  };
  return createR2Storage(options);
}

export function createR2ClientFromEnv(): R2Config {
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

export function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export function generateUniqueFileName(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${prefix}${prefix ? '_' : ''}${baseName}_${timestamp}_${random}.${ext}`;
}

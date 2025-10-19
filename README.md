# SDK Tool

A multi-environment SDK with R2 storage support for Node.js and browser environments.

## Installation

```bash
npm install @teenth/sdk-tool
```

## Usage

### Automatic Environment Detection

The SDK automatically detects your environment and provides the appropriate functionality:

```javascript
import { get, post, grsaiChat, VERSION } from "@teenth/sdk-tool";

// These functions work in both Node.js and browser environments
console.log(VERSION);
```

### Node.js Environment (Full Features)

In Node.js, you get access to all features including R2 storage:

```javascript
import { createR2Storage, type R2Config } from '@teenth/sdk-tool';

const config: R2Config = {
  accountId: "your-account-id",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "your-bucket",
  cdnDomain: "https://cdn.example.com"
};

const r2Storage = createR2Storage(config);
const result = await r2Storage.upload("image.jpg", file);
```

### Browser Environment (Limited Features)

In browser environments, R2 storage features are not available to avoid Node.js dependencies:

```javascript
import { get, post, grsaiChat } from "@teenth/sdk-tool";

// Chat and HTTP request functions work normally
const response = await get("https://api.example.com/data");
```

### Explicit Environment Import

You can also explicitly import the version you need:

```javascript
// Explicitly import browser version
import { get, post } from "@teenth/sdk-tool/browser";

// Explicitly import Node.js version
import { createR2Storage } from "@teenth/sdk-tool/node";
```

## Features

### Available in All Environments

- HTTP requests (`get`, `post`)
- Chat functions (`grsaiChat`, `tuziFlux`, `replicateFlux`, `kieChat`)
- Utility functions (`getMimeType`, `generateUniqueFileName`)

### Node.js Only

- R2 storage operations (`createR2Storage`)
- File system operations
- R2 client utilities (`createR2Client`, `createR2ClientFromEnv`)

## API Reference

### HTTP Functions

- `get(url: string, options?: RequestOptions): Promise<any>`
- `post(url: string, data?: any, options?: RequestOptions): Promise<any>`

### Chat Functions

- `grsaiChat(messages: ChatMessage[]): Promise<ChatResponse>`
- `tuziFlux(prompt: string): Promise<ImageResponse>`
- `replicateFlux(prompt: string): Promise<ImageResponse>`
- `kieChat(message: string): Promise<ChatResponse>`

### R2 Storage (Node.js only)

- `createR2Storage(config: R2Config): R2StorageInstance`
- `R2StorageInstance.upload(fileName: string, data: FileInput): Promise<UploadResult>`
- `R2StorageInstance.get(fileName: string): Promise<any>`
- `R2StorageInstance.delete(fileName: string): Promise<void>`

## License

MIT

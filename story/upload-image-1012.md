# ImageUpload 组件设计文档

## 组件概述

`ImageUpload` 是一个通用的图片上传组件，支持拖拽上传、点击上传，最多支持9张图片，每次只能上传一张。

## 功能规格

### 核心功能
- 每次只能上传一张图片
- 最多9张图片，超出提示"Maximum 9 images allowed"
- 只支持图片格式 (`accept="image/*"`)

### UI设计
- 拖拽区域：最小宽度200px，高度自适应
- 默认文字："Click or drag images to upload"
- 拖拽时文字："Drop to upload"
- 拖拽时边框变色提示

### 文件列表
- 新上传图片在前面
- 显示图片缩略图（100x100固定尺寸）
- 红色"×"删除按钮在右上角
- 只前端删除，不调用后端API
- 点击图片无操作

### 上传逻辑
- 串行上传（每次只能传一张）
- 上传中显示："Uploading..."
- 上传时整个组件禁用
- 上传失败不显示，不重试

### API集成
- 配置：`{ apiUrl: string }`
- 期望返回：`{data: {url: string}, code: number}`
- 只需要配置apiUrl

### 移动端适配
- 拖拽区域可点击上传
- 跟随父容器尺寸

### 错误处理
- 组件内显示错误信息
- 文件类型错误提示
- 数量超限提示

## 组件接口

### Props

```typescript
interface ImageUploadProps {
  config: {
    apiUrl: string;
  };
  onSuccess?: (response: { url: string }) => void;
  onError?: (error: Error) => void;
  onUploadStart?: (file: File) => void;
  onUploadComplete?: () => void;
  className?: string;
}
```

### 使用示例

```jsx
import { ImageUpload } from '@teenth/sdk-tool';

function MyComponent() {
  return (
    <ImageUpload
      config={{ apiUrl: 'https://api.example.com/upload' }}
      onSuccess={(response) => console.log('Upload success:', response.url)}
      onError={(error) => console.error('Upload failed:', error)}
    />
  );
}
```

## 实现细节

### 状态管理
- `images`: 已上传成功的图片URL数组
- `uploading`: 当前是否正在上传
- `dragging`: 是否正在拖拽
- `error`: 错误信息

### 布局结构
```
┌─────────────────────┐
│   拖拽上传区域         │
│   (最小宽度200px)      │
├─────────────────────┤
│   图片列表区域         │
│   ┌───┬───┬───┐      │
│   │img│img│img│      │
│   └───┴───┴───┘      │
└─────────────────────┘
```

### 样式规范
- 图片缩略图：100x100px
- 删除按钮：红色"×"，右上角
- 拖拽区域：虚线边框，拖拽时变色
- 组件内padding：16px

## 技术要求

### 浏览器兼容性
- 支持现代浏览器（Chrome 70+, Firefox 65+, Safari 12+）
- 支持移动端浏览器

### TypeScript支持
- 完整的TypeScript类型定义
- 严格的类型检查

### 性能要求
- 图片预览使用懒加载
- 上传时防重复点击
- 内存泄漏防护

## 文件结构

```
src/
├── react/
│   ├── components/
│   │   ├── ImageUpload.tsx    # 主组件
│   │   ├── DragDropArea.tsx   # 拖拽区域子组件
│   │   └── ImageList.tsx      # 图片列表子组件
│   ├── hooks/
│   │   └── useImageUpload.ts  # 上传逻辑hook
│   └── types/
│       └── upload.ts          # 类型定义
└── index.ts                   # 导出入口
```

## 测试计划

### 单元测试
- 组件渲染测试
- 文件上传逻辑测试
- 错误处理测试
- 拖拽功能测试

### 集成测试
- 与后端API集成测试
- 多文件上传测试
- 移动端兼容性测试

### E2E测试
- 完整上传流程测试
- 拖拽上传流程测试
- 错误场景测试

## 发布计划

- 版本：v2.3.0
- 发布日期：2025-10-12
- 变更内容：新增ImageUpload组件

## 维护说明

### 已知限制
- 不支持文件预览（只显示上传成功后的图片）
- 不支持上传重试
- 不支持批量同时上传

### 后续优化计划
- 支持图片压缩
- 支持批量上传
- 支持上传进度显示
- 支持更多文件类型
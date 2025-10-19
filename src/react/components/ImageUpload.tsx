import React, { useState } from 'react';
import { DragDropArea } from './DragDropArea';
import { ImageList } from './ImageList';
import { useImageUpload } from '../hooks/useImageUpload';
import { ImageUploadProps } from '../types/upload';

export function ImageUpload({
  config,
  onSuccess,
  onError,
  onUploadStart,
  onUploadComplete,
  className,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { uploadImage, uploading, error: uploadError, clearError } = useImageUpload(config);

  const MAX_IMAGES = 9;

  const handleFileSelect = async (file: File) => {
    setError(null);
    clearError();

    // 检查图片数量限制
    if (images.length >= MAX_IMAGES) {
      const errorMsg = 'Maximum 9 images allowed';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    try {
      onUploadStart?.(file);
      const url = await uploadImage(file);
      
      // 新图片添加到前面
      setImages(prev => [url, ...prev]);
      onSuccess?.({ url });
    } catch (err) {
      // 错误已经在useImageUpload中处理
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      onUploadComplete?.();
    }
  };

  const handleRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    clearError();
  };

  // 合并错误信息
  const displayError = error || uploadError;

  return (
    <>
      <div className={`image-upload-container ${className || ''}`}>
        <DragDropArea
          onFileSelect={handleFileSelect}
          disabled={uploading}
        />
        
        {uploading && (
          <div className="uploading-status">
            Uploading...
          </div>
        )}

        {displayError && (
          <div className="error-message">
            {displayError}
          </div>
        )}

        <ImageList
          images={images}
          onRemove={handleRemove}
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .image-upload-container {
          padding: 16px;
          min-width: 200px;
        }

        .uploading-status {
          margin-top: 12px;
          padding: 8px 12px;
          background-color: #eff6ff;
          color: #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }

        .error-message {
          margin-top: 12px;
          padding: 8px 12px;
          background-color: #fef2f2;
          color: #ef4444;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }
        `
      }} />
    </>
  );
}
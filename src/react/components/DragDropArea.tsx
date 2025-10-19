import React, { useRef, useState } from 'react';

interface DragDropAreaProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DragDropArea({ onFileSelect, disabled }: DragDropAreaProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
    // 清空文件选择器
    e.target.value = '';
  };

  return (
    <>
      <div
        className={`image-upload-drag-area ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="drag-area-content">
          <div className="drag-icon">📸</div>
          <div className="drag-text">
            {dragging ? 'Drop to upload' : 'Click or drag images to upload'}
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
        .image-upload-drag-area {
          min-width: 200px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 32px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #f9fafb;
        }

        .image-upload-drag-area:hover:not(.disabled) {
          border-color: #6b7280;
          background-color: #f3f4f6;
        }

        .image-upload-drag-area.dragging {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .image-upload-drag-area.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .drag-area-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drag-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .drag-text {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .dragging .drag-text {
          color: #3b82f6;
        }
        `
      }} />
    </>
  );
}
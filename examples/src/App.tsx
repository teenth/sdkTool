import React, { useState } from 'react';
import './DragDropArea.css';
import './ImageList.css';
import './ImageUpload.css';

// 简化的DragDropArea组件
function DragDropArea({ onFileSelect, disabled }: { onFileSelect: (file: File) => void, disabled?: boolean }) {
  const [dragging, setDragging] = React.useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
    if (disabled) return;
    
    // 创建一个新的文件输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          onFileSelect(file);
        }
      }
    };
    fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
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
      </>
  );
}

// 简化的ImageList组件
function ImageList({ images, onRemove }: { images: string[], onRemove: (index: number) => void }) {
  if (images.length === 0) return null;

  return (
    <div className="image-list">
      {images.map((url, index) => (
        <div key={`${url}-${index}`} className="image-item">
          <img
            src={url}
            alt={`Uploaded ${index + 1}`}
            className="image-thumbnail"
          />
          <button
            className="remove-button"
            onClick={() => onRemove(index)}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// 简化的ImageUpload组件
function ImageUpload({
  config,
  onSuccess,
  onError,
  onUploadStart,
  onUploadComplete,
}: {
  config: { apiUrl: string };
  onSuccess?: (response: { url: string }) => void;
  onError?: (error: Error) => void;
  onUploadStart?: (file: File) => void;
  onUploadComplete?: () => void;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 9;

  const handleFileSelect = async (file: File) => {
    setError(null);

    if (images.length >= MAX_IMAGES) {
      const errorMsg = 'Maximum 9 images allowed';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    try {
      setUploading(true);
      onUploadStart?.(file);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // 对于httpbin.org，我们模拟一个成功响应
      const mockUrl = `https://picsum.photos/seed/${Date.now()}/100/100.jpg`;
      setImages(prev => [mockUrl, ...prev]);
      onSuccess?.({ url: mockUrl });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setUploading(false);
      onUploadComplete?.();
    }
  };

  const handleRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className="image-upload-container">
      <DragDropArea
        onFileSelect={handleFileSelect}
        disabled={uploading}
      />
      
      {uploading && (
        <div className="uploading-status">
          Uploading...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <ImageList
        images={images}
        onRemove={handleRemove}
      />
    </div>
  );
}

function App() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleSuccess = (response: { url: string }) => {
    console.log('Upload success:', response);
    setUploadedImages(prev => [...prev, response.url]);
  };

  const handleError = (error: Error) => {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error.message}`);
  };

  const handleUploadStart = (file: File) => {
    console.log('Upload started:', file.name);
  };

  const handleUploadComplete = () => {
    console.log('Upload completed');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>SDK Tool React Examples</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>ImageUpload Component Demo</h2>
        <p>This is a demo of the ImageUpload component with drag & drop support.</p>
        
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Basic Usage</h3>
          <p>ImageUpload component:</p>
          <ImageUpload
            config={{ 
              apiUrl: 'https://www.molexhub.com/api/upload'
            }}
            onSuccess={handleSuccess}
            onError={handleError}
            onUploadStart={handleUploadStart}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {uploadedImages.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Uploaded Images (for demo purposes):</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {uploadedImages.map((url, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <img 
                    src={url} 
                    alt={`Uploaded ${index + 1}`}
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p><strong>Note:</strong> This demo uses httpbin.org for testing and mock images. 
          In a real application, replace the apiUrl with your actual upload endpoint.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
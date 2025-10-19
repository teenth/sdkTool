import React from 'react';

interface ImageListProps {
  images: string[];
  onRemove: (index: number) => void;
}

export function ImageList({ images, onRemove }: ImageListProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <>
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
      <style dangerouslySetInnerHTML={{
        __html: `
        .image-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .image-item {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .image-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .remove-button {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #ef4444;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
          padding: 0;
          transition: background-color 0.2s ease;
        }

        .remove-button:hover {
          background-color: #dc2626;
        }

        .remove-button:active {
          background-color: #b91c1c;
        }
        `
      }} />
    </>
  );
}
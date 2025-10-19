export interface UploadConfig {
  apiUrl: string;
}

export interface UploadResponse {
  data: {
    url: string;
  };
  code: number;
}

export interface ImageUploadProps {
  config: UploadConfig;
  onSuccess?: (response: { url: string }) => void;
  onError?: (error: Error) => void;
  onUploadStart?: (file: File) => void;
  onUploadComplete?: () => void;
  className?: string;
}
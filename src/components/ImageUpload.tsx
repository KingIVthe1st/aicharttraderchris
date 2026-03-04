import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: Error) => void;
  accept?: string[];
  maxSize?: number;
  label?: string;
  className?: string;
}

export function ImageUpload({
  onUploadComplete,
  onError,
  accept = ['image/*'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = 'Upload Chart Image',
  className = '',
}: ImageUploadProps) {
  const { upload, isUploading, progress, error, reset } = useFileUpload({
    onSuccess: onUploadComplete,
    onError,
    fileKind: 'chart',
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        reset();
        upload(acceptedFiles[0]);
      }
    },
    [upload, reset]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-sm text-gray-600">Uploading... {Math.round(progress)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? (
                <span className="font-medium text-blue-600">Drop the image here</span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and
                  drop
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Upload failed. Please try again.'}
        </p>
      )}

      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {fileRejections[0].errors.map((err) => (
            <p key={err.code}>{err.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}

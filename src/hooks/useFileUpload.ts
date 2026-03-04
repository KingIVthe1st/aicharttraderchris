import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '@/lib/api/upload';
import type { FileKind } from '@/types/api';

interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  fileKind: FileKind;
}

export function useFileUpload({ onSuccess, onError, fileKind }: UseFileUploadOptions) {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadApi.uploadFile(file, fileKind, setProgress);
      return url;
    },
    onSuccess: (url) => {
      setProgress(100);
      onSuccess?.(url);
    },
    onError: (error: Error) => {
      setProgress(0);
      onError?.(error);
    },
  });

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error,
    reset: () => {
      mutation.reset();
      setProgress(0);
    },
  };
}

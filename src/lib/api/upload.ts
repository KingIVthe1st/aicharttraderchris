import apiClient from '../api-client';
import type { FileKind, UploadUrlRequest, UploadUrlResponse } from '@/types/api';
import { compressImage, getCompressionPresets } from '../utils/image-compression';

export const uploadApi = {
  /**
   * Get presigned S3 upload URL
   */
  async getUploadUrl(
    fileName: string,
    fileType: string,
    fileKind: FileKind
  ): Promise<UploadUrlResponse> {
    const response = await apiClient.post<UploadUrlResponse>('/upload-url', {
      fileName,
      fileType,
      fileKind,
    } satisfies UploadUrlRequest);

    return response.data;
  },

  /**
   * Upload file directly to backend/R2 using the upload URL
   */
  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const headers: HeadersInit = {
      'Content-Type': file.type,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again. (401)');
      }

      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }
  },

  /**
   * Complete upload flow: compress image (if needed), get URL, upload file, return final URL
   */
  async uploadFile(
    file: File,
    fileKind: FileKind,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    let processedFile = file;

    // Compress image before upload to reduce token costs and improve performance
    if (file.type.startsWith('image/')) {
      if (onProgress) onProgress(10);

      try {
        // Use 'chart' preset for high quality while still compressing
        const compressionOptions = getCompressionPresets('chart');
        processedFile = await compressImage(file, compressionOptions);

        console.log('[Upload] Image compressed:', {
          original: (file.size / 1024).toFixed(2) + ' KB',
          compressed: (processedFile.size / 1024).toFixed(2) + ' KB',
          saved: ((1 - processedFile.size / file.size) * 100).toFixed(1) + '%'
        });
      } catch (error) {
        console.warn('[Upload] Compression failed, using original:', error);
        processedFile = file;
      }

      if (onProgress) onProgress(30);
    }

    // Get presigned URL
    const { uploadUrl, finalUrl } = await this.getUploadUrl(
      processedFile.name,
      processedFile.type,
      fileKind
    );

    // Upload to R2
    if (onProgress) {
      onProgress(60);
    }

    await this.uploadToS3(uploadUrl, processedFile);

    if (onProgress) {
      onProgress(100);
    }

    return finalUrl;
  },
};

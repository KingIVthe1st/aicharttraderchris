import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { ChartData } from '@/types/api';

interface MultiImageUploadProps {
  charts: ChartData[];
  onChartsChange: (charts: ChartData[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({
  charts,
  onChartsChange,
  maxImages = 5,
}: MultiImageUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const { upload, isUploading, progress, error, reset } = useFileUpload({
    onSuccess: (url) => {
      if (uploadingIndex !== null) {
        const updatedCharts = [...charts];
        updatedCharts[uploadingIndex] = { ...updatedCharts[uploadingIndex], url };
        onChartsChange(updatedCharts);
        setUploadingIndex(null);
      }
    },
    fileKind: 'chart',
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = maxImages - charts.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      filesToUpload.forEach((file, index) => {
        const chartIndex = charts.length + index;
        const newChart: ChartData = {
          url: '',
          type: 'ltf',
          timeframe: '1h',
          description: '',
        };

        onChartsChange([...charts, newChart]);
        setUploadingIndex(chartIndex);
        reset();
        upload(file);
      });
    },
    [charts, maxImages, onChartsChange, upload, reset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: isUploading || charts.length >= maxImages,
  });

  const removeChart = (index: number) => {
    const updatedCharts = charts.filter((_, i) => i !== index);
    onChartsChange(updatedCharts);
  };

  const updateChart = (index: number, updates: Partial<ChartData>) => {
    const updatedCharts = [...charts];
    updatedCharts[index] = { ...updatedCharts[index], ...updates };
    onChartsChange(updatedCharts);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {charts.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
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
                <span className="font-medium text-blue-600">Drop images here</span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and
                  drop
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Upload up to {maxImages} chart images ({charts.length}/{maxImages})
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'Upload failed. Please try again.'}
        </p>
      )}

      {/* Chart List */}
      {charts.length > 0 && (
        <div className="space-y-4">
          {charts.map((chart, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900">Chart {index + 1}</h4>
                <button
                  onClick={() => removeChart(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                  disabled={isUploading && uploadingIndex === index}
                >
                  Remove
                </button>
              </div>

              {/* Upload Progress */}
              {isUploading && uploadingIndex === index && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Uploading... {Math.round(progress)}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Chart Preview */}
              {chart.url && (
                <img
                  src={chart.url}
                  alt={`Chart ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {/* Timeframe Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                <select
                  value={chart.timeframe}
                  onChange={(e) => updateChart(index, { timeframe: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                  <option value="1w">1 Week</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={chart.description || ''}
                  onChange={(e) => updateChart(index, { description: e.target.value })}
                  placeholder="Add any additional context about this chart..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

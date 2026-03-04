import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { historyApi } from '@/lib/api/history';
import { format } from 'date-fns';

export default function History() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  // Auto-select analysis from URL parameter
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedAnalysis(id);
    }
  }, [searchParams]);

  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['history'],
    queryFn: () => historyApi.getHistory(),
  });

  const { data: analysisDetail } = useQuery({
    queryKey: ['analysis', selectedAnalysis],
    queryFn: () => historyApi.getAnalysis(selectedAnalysis!),
    enabled: !!selectedAnalysis,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="mt-2 text-gray-600">
            Review your past trade analyses and their results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List Panel */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Analyses</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-sm text-red-600">Failed to load analyses. Please try again.</p>
                </div>
              ) : !analyses || analyses.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No analyses yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your analysis history will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {analyses.map((analysis) => (
                    <button
                      key={analysis.id}
                      onClick={() => setSelectedAnalysis(analysis.id)}
                      className={`w-full text-left border rounded-lg p-4 hover:border-blue-500 transition-colors ${
                        selectedAnalysis === analysis.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {analysis.instrument} - {analysis.contract}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            analysis.status === 'trade'
                              ? 'bg-green-100 text-green-800'
                              : analysis.status === 'no_trade'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {analysis.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {analysis.createdAt && !isNaN(new Date(Number(analysis.createdAt) * 1000).getTime())
                          ? format(new Date(Number(analysis.createdAt) * 1000), 'MMM d, yyyy h:mm a')
                          : 'Invalid Date'}
                      </p>
                      {analysis.latencyMs && (
                        <p className="text-xs text-gray-400 mt-1">
                          Analysis time: {(analysis.latencyMs / 1000).toFixed(2)}s
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Details</h2>

              {!selectedAnalysis ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an analysis from the list to view details
                  </p>
                </div>
              ) : !analysisDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Action Badge and Continue Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        analysisDetail.status === 'trade'
                          ? 'bg-green-100 text-green-800'
                          : analysisDetail.status === 'no_trade'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {analysisDetail.status?.toUpperCase().replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => navigate(`/analysis?historyId=${selectedAnalysis}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Continue Conversation
                    </button>
                  </div>

                  {/* Conversation Messages */}
                  {analysisDetail.messages && analysisDetail.messages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Conversation</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {analysisDetail.messages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-gray-700 uppercase">
                                {message.role === 'user' ? 'You' : 'Assistant'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(message.createdAt * 1000), 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
                            {message.images && message.images.length > 0 && (
                              <div className="mt-2 flex gap-2 flex-wrap">
                                {message.images.map((img: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Chart ${idx + 1}`}
                                    className="h-20 w-auto rounded border border-gray-300"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {analysisDetail.summary_text && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {analysisDetail.summary_text}
                      </p>
                    </div>
                  )}

                  {/* Rationale */}
                  {analysisDetail.modelResponse?.rationale && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Rationale</h3>
                      <ul className="space-y-1">
                        {analysisDetail.modelResponse.rationale.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Validation */}
                  {analysisDetail.modelResponse?.validation && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Validation Checks
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(analysisDetail.modelResponse.validation).map(
                          ([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span
                                className={`font-medium ${
                                  value ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {value ? '✓ Pass' : '✗ Fail'}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price Levels */}
                  {analysisDetail.modelResponse?.priceLevels && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Price Levels</h3>
                      <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entry:</span>
                          <span className="font-medium">
                            {analysisDetail.modelResponse.priceLevels.entry}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stop:</span>
                          <span className="font-medium text-red-600">
                            {analysisDetail.modelResponse.priceLevels.stop}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Targets:</span>
                          <span className="font-medium text-green-600">
                            {analysisDetail.modelResponse.priceLevels.targets.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ATM Data */}
                  {analysisDetail.atm && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">ATM Configuration</h3>
                      <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bias:</span>
                          <span className="font-medium capitalize">{analysisDetail.atm.bias}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entry:</span>
                          <span className="font-medium">{analysisDetail.atm.entry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distal:</span>
                          <span className="font-medium">{analysisDetail.atm.distal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stop Ticks:</span>
                          <span className="font-medium">{analysisDetail.atm.stop_ticks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Ticks:</span>
                          <span className="font-medium">
                            {analysisDetail.atm.target_ticks.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        Created:{' '}
                        {analysisDetail.createdAt && !isNaN(new Date(Number(analysisDetail.createdAt) * 1000).getTime())
                          ? format(new Date(Number(analysisDetail.createdAt) * 1000), 'MMM d, yyyy h:mm:ss a')
                          : 'Invalid Date'}
                      </p>
                      {analysisDetail.latencyMs && (
                        <p>Analysis time: {(analysisDetail.latencyMs / 1000).toFixed(2)}s</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

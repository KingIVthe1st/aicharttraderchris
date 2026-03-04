import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Send, Image as ImageIcon, Paperclip, Sparkles, Moon, Sun } from 'lucide-react';
import { streamAnalysis } from '@/lib/api/analyze';
import { uploadApi } from '@/lib/api/upload';
import { historyApi } from '@/lib/api/history';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChartData, AnalyzeRequest } from '@/types/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: Array<ChartData & { file?: File }>;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function Analysis() {
  const { isActiveSubscriber } = useAuth();
  const [searchParams] = useSearchParams();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('tradvio-theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });

  // Analysis mode: 'trader' (concise) or 'mentor' (educational)
  const [analysisMode, setAnalysisMode] = useState<'trader' | 'mentor'>(() => {
    const saved = localStorage.getItem('tradvio-analysis-mode');
    return (saved as 'trader' | 'mentor') || 'mentor'; // Default to mentor mode
  });

  // Cosmic overlay toggle
  const [cosmicOverlay, setCosmicOverlay] = useState(() => {
    const saved = localStorage.getItem('tradvio-cosmic-overlay');
    return saved === 'true';
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Chart Trader AI, your AI trading analyst. Upload your chart images and tell me about your trade setup. I'll analyze it and provide detailed multi-timeframe insights.\n\nYou can drag and drop images directly here, or paste them from your clipboard!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<ChartData & { file?: File }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/signin?redirect=/analysis';
    }
  }, []);

  // Load existing conversation if historyId is present
  useEffect(() => {
    const id = searchParams.get('historyId');
    if (id) {
      setHistoryId(id);
      loadConversation(id);
    }
  }, [searchParams]);

  const loadConversation = async (id: string) => {
    try {
      const analysis = await historyApi.getAnalysis(id);

      // Convert chat messages to Message format
      const loadedMessages: Message[] = [];

      if (analysis.messages && analysis.messages.length > 0) {
        for (const msg of analysis.messages) {
          loadedMessages.push({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            images: msg.images ? msg.images.map((url: string) => ({ type: 'chart', url })) : undefined,
            timestamp: new Date(msg.createdAt * 1000)
          });
        }
      }

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Show error message
      setMessages([{
        id: 'error',
        role: 'assistant',
        content: 'Failed to load conversation. Please try again or start a new analysis.',
        timestamp: new Date()
      }]);
    }
  };

  useEffect(() => {
    localStorage.setItem('tradvio-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('tradvio-analysis-mode', analysisMode);
  }, [analysisMode]);

  useEffect(() => {
    localStorage.setItem('tradvio-cosmic-overlay', cosmicOverlay.toString());
  }, [cosmicOverlay]);

  const toggleAnalysisMode = () => {
    setAnalysisMode(prev => {
      const newMode = prev === 'trader' ? 'mentor' : 'trader';
      console.log('[MODE DEBUG] Toggling mode from', prev, 'to', newMode);
      return newMode;
    });
  };

  // Prevent browser's default drag and drop behavior (opening images in new window)
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent default drag behaviors on the entire document
    document.addEventListener('dragover', preventDefaults);
    document.addEventListener('drop', preventDefaults);
    document.addEventListener('dragenter', preventDefaults);
    document.addEventListener('dragleave', preventDefaults);

    return () => {
      document.removeEventListener('dragover', preventDefaults);
      document.removeEventListener('drop', preventDefaults);
      document.removeEventListener('dragenter', preventDefaults);
      document.removeEventListener('dragleave', preventDefaults);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (files: FileList) => {
    const newCharts: Array<ChartData & { file?: File }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);

      newCharts.push({
        type: 'chart',
        url: previewUrl,
        file: file,
      });
    }

    setUploadedImages((prev) => [...prev, ...newCharts]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      handleImageUpload(dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedImages.length === 0) return;
    if (!isActiveSubscriber) {
      alert('Active subscription required to perform analysis.');
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim() || 'Please analyze these charts',
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuery = inputMessage.trim();
    setInputMessage('');
    const currentImages = [...uploadedImages];
    setUploadedImages([]);
    setIsAnalyzing(true);

    // Create streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Upload images to R2 first
      const uploadedCharts: ChartData[] = [];

      for (const chart of currentImages) {
        if (chart.file) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: `Uploading image ${uploadedCharts.length + 1}/${currentImages.length}...` }
                : msg
            )
          );

          try {
            const finalUrl = await uploadApi.uploadFile(chart.file, 'chart');
            uploadedCharts.push({
              type: chart.type || 'chart',
              url: finalUrl,
              timeframe: chart.timeframe,
              description: chart.description,
            });
          } catch (uploadError: any) {
            if (uploadError.message?.includes('401') || uploadError.response?.status === 401) {
              // Auth error - redirect to login
              localStorage.removeItem('auth_token');
              window.location.href = '/signin?redirect=/analysis';
              return;
            }
            throw uploadError;
          }
        } else if (chart.url) {
          uploadedCharts.push(chart);
        }
      }

      // Clear upload status message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: '' }
            : msg
        )
      );

      // Build conversation history for OpenAI
      const conversationHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        images: msg.images?.map(img => img.url),
        timestamp: msg.timestamp.toISOString(),
      }));

      // Prepare analysis request with ATM data and conversation history
      console.log('[MODE DEBUG] Current analysisMode state:', analysisMode);
      const analysisRequest: AnalyzeRequest = {
        instrument: 'ES', // Default instrument - could be extracted from user message
        contract: 'ESZ24',
        charts: uploadedCharts,
        atm: {
          bias: 'long', // Default - could be extracted from user message
          stop_ticks: 8, // Default stop loss in ticks
          target_ticks: [16, 32], // Default targets in ticks
        },
        useConversation: true, // Enable conversational mode
        conversationHistory, // Send full conversation for context
        mode: analysisMode, // Pass analysis mode to backend
        includeCosmic: cosmicOverlay, // Include cosmic overlay context
      };
      console.log('[MODE DEBUG] analysisRequest.mode:', analysisRequest.mode);

      // Add user query as a chart description if no charts uploaded
      if (uploadedCharts.length === 0 && userQuery) {
        analysisRequest.charts = [{
          type: 'daily',
          url: '',
          description: userQuery,
        }];
      } else if (userQuery && uploadedCharts.length > 0) {
        // Add user query to first chart description
        analysisRequest.charts[0].description = userQuery;
      }

      // Stream the analysis - use different API if continuing conversation
      let fullContent = '';

      if (historyId) {
        // Continuing existing conversation
        const imageUrls = uploadedCharts.map(chart => chart.url);
        const response = await historyApi.continueConversation(historyId, userQuery || 'Please analyze', imageUrls, analysisMode);

        // Stream the response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        const cancelFunc = () => reader.cancel();
        cancelStreamRef.current = cancelFunc;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    fullContent += parsed.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: fullContent }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        } finally {
          setIsAnalyzing(false);
          cancelStreamRef.current = null;
        }
      } else {
        // New analysis - use existing flow
        const cancelStream = await streamAnalysis(analysisRequest, {
          onChunk: (chunk) => {
            fullContent += chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullContent }
                  : msg
              )
            );
          },
          onDone: (result) => {
            // Optionally format the structured result
            console.log('Analysis complete:', result);
          },
          onError: (error) => {
            console.error('Analysis error:', error);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: fullContent || `Sorry, there was an error: ${error}`,
                      isStreaming: false
                    }
                  : msg
              )
            );
          },
          onComplete: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setIsAnalyzing(false);
            cancelStreamRef.current = null; // Clear cancel function
          },
        });

        // Store cancel function in ref
        cancelStreamRef.current = cancelStream;
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Sorry, there was an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isStreaming: false
              }
            : msg
        )
      );
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCancelStream = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
      setIsAnalyzing(false);

      // Mark last message as stopped
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          lastMsg.isStreaming = false;
          lastMsg.content += '\n\n_[Response stopped by user]_';
        }
        return updated;
      });
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className={`absolute inset-0 ${darkMode ? 'opacity-20' : 'opacity-10'}`}
          style={{
            backgroundImage: `linear-gradient(${darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating Orbs */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-500/20'} rounded-full blur-3xl animate-pulse-slow`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-500/20'} rounded-full blur-3xl animate-pulse-slow`} style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 ${darkMode ? 'bg-cyan-500/10' : 'bg-cyan-500/20'} rounded-full blur-3xl animate-pulse-slow`} style={{ animationDelay: '2s' }} />

        {/* Scan Lines Effect */}
        <div className={`absolute inset-0 ${darkMode ? 'opacity-5' : 'opacity-3'}`}
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.03) 2px, rgba(59, 130, 246, 0.03) 4px)'
          }}
        />
      </div>

      {/* Header */}
      <div className={`relative z-10 backdrop-blur-xl border-b px-6 py-4 transition-colors duration-500 ${
        darkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="relative">
                <Sparkles className={`w-7 h-7 animate-pulse ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className={`absolute inset-0 blur-lg animate-pulse ${darkMode ? 'bg-blue-400/50' : 'bg-blue-600/30'}`} />
              </div>
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Chart Trader AI
              </span>
            </h1>
            <p className={`text-sm mt-1.5 ml-10 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Upload charts and describe your trade for instant AI-powered analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Cancel Button (shows during analysis) */}
            {isAnalyzing && (
              <button
                onClick={handleCancelStream}
                className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 font-medium text-sm ${
                  darkMode
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                }`}
                title="Stop AI response"
              >
                ⏹ Stop
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!isActiveSubscriber && (
              <div className={`text-sm px-4 py-2 rounded-xl backdrop-blur-sm border ${
                darkMode
                  ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                  : 'text-orange-600 bg-orange-50 border-orange-200'
              }`}>
                Subscription required
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 relative z-10"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden ${
                  message.role === 'user'
                    ? darkMode
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 border border-blue-400/20'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-300'
                    : darkMode
                      ? 'bg-white/10 text-white shadow-xl border border-white/20'
                      : 'bg-white shadow-lg border border-gray-200 text-gray-900'
                }`}
              >
                {/* Message Images */}
                {message.images && message.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {message.images.map((img, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-xl">
                        <img
                          src={img.url}
                          alt={`Chart ${idx + 1}`}
                          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Content */}
                {message.role === 'assistant' ? (
                  <div className={`${darkMode ? 'prose prose-sm prose-invert max-w-none' : 'prose prose-sm max-w-none'}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Paragraphs with proper spacing
                        p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,

                        // Headings with spacing
                        h1: ({node, ...props}) => <h1 className="mt-4 mb-2 font-bold text-lg" {...props} />,
                        h2: ({node, ...props}) => <h2 className="mt-4 mb-2 font-bold text-base" {...props} />,
                        h3: ({node, ...props}) => <h3 className="mt-3 mb-2 font-semibold text-sm" {...props} />,
                        h4: ({node, ...props}) => <h4 className="mt-2 mb-1 font-semibold text-sm" {...props} />,

                        // Lists with proper spacing
                        ul: ({node, ...props}) => <ul className="my-2 ml-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="my-2 ml-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,

                        // Code blocks
                        code: ({node, className, ...props}) => {
                          const isInline = !className?.includes('language-');
                          return isInline ? (
                            <code className={`${darkMode ? 'bg-white/10' : 'bg-gray-100'} px-1 py-0.5 rounded text-sm`} {...props} />
                          ) : (
                            <code className={className} {...props} />
                          );
                        },
                        pre: ({node, ...props}) => (
                          <pre className={`overflow-x-auto p-3 rounded-lg my-2 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`} {...props} />
                        ),

                        // Blockquotes
                        blockquote: ({node, ...props}) => (
                          <blockquote className={`border-l-4 pl-4 my-3 italic ${darkMode ? 'border-cyan-500' : 'border-blue-500'}`} {...props} />
                        ),

                        // Tables
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-3">
                            <table className="min-w-full divide-y" {...props} />
                          </div>
                        ),

                        // Strong and emphasis
                        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,

                        // Links
                        a: ({node, ...props}) => (
                          <a className={`${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'} underline`} {...props} />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words text-white leading-relaxed"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {message.content}
                  </div>
                )}

                {/* Streaming Indicator */}
                {message.isStreaming && (
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${darkMode ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-blue-500 shadow-blue-500/30'}`} />
                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${darkMode ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-blue-500 shadow-blue-500/30'}`} style={{ animationDelay: '0.2s' }} />
                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${darkMode ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-blue-500 shadow-blue-500/30'}`} style={{ animationDelay: '0.4s' }} />
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-xs mt-3 font-medium ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : darkMode
                      ? 'text-slate-400'
                      : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className={`fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in ${
            darkMode ? 'bg-blue-600/20' : 'bg-blue-500/30'
          }`}>
            <div className={`rounded-3xl p-12 shadow-2xl border-2 border-dashed transform scale-95 hover:scale-100 transition-transform duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-cyan-500'
                : 'bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-2xl border-blue-500'
            }`}>
              <div className="relative">
                <ImageIcon className={`w-20 h-20 mx-auto mb-6 animate-bounce ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                <div className={`absolute inset-0 blur-2xl animate-pulse ${darkMode ? 'bg-cyan-400/30' : 'bg-blue-600/20'}`} />
              </div>
              <p className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Drop your charts here</p>
              <p className={`text-sm mt-3 text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Upload chart images for instant AI analysis</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`relative z-10 backdrop-blur-xl border-t px-6 py-4 transition-colors duration-500 ${
        darkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-5xl mx-auto">
          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="mb-3 flex gap-3 flex-wrap">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm ${
                    darkMode
                      ? 'border-white/20 bg-white/5'
                      : 'border-gray-300 bg-gray-100'
                  }`}>
                    <img
                      src={img.url}
                      alt={`Upload ${idx + 1}`}
                      className="w-24 h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg shadow-red-500/50 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="flex items-end gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 backdrop-blur-sm border hover:scale-105 ${
                darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-300 hover:border-gray-400'
              }`}
              title="Upload images"
              data-tour="add-chart-button"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Analysis Mode Toggle */}
            <div className="relative group flex-shrink-0" data-tour="mode-selector">
              <button
                onClick={toggleAnalysisMode}
                className={`px-4 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border font-medium text-sm hover:scale-105 ${
                  analysisMode === 'trader'
                    ? darkMode
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30'
                      : 'bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-400 text-cyan-700 hover:from-cyan-200 hover:to-blue-200'
                    : darkMode
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30'
                      : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 text-purple-700 hover:from-purple-200 hover:to-pink-200'
                }`}
              >
                {analysisMode === 'trader' ? '⚡ Trader' : '🎓 Mentor'}
              </button>

              {/* Hover Tooltip */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 rounded-xl backdrop-blur-xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-50 ${
                darkMode
                  ? 'bg-slate-900/95 border-white/20 text-white'
                  : 'bg-white/95 border-gray-300 text-gray-900'
              }`}>
                {/* Arrow */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 rotate-45 border-r border-b ${
                  darkMode ? 'bg-slate-900/95 border-white/20' : 'bg-white/95 border-gray-300'
                }`} />

                {analysisMode === 'trader' ? (
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⚡</span>
                      <h4 className={`font-bold text-base ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        Trader Mode
                      </h4>
                    </div>
                    <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      <strong>For experienced traders</strong> who need fast, actionable intelligence without hand-holding.
                    </p>
                    <ul className={`text-xs space-y-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>✓</span>
                        <span>Ultra-concise: 150-250 words</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>✓</span>
                        <span>Bullet points only, no explanations</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>✓</span>
                        <span>Direct entries, stops, targets & R:R</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>✓</span>
                        <span>Assumes expert-level knowledge</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎓</span>
                      <h4 className={`font-bold text-base ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                        Mentor Mode
                      </h4>
                    </div>
                    <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      <strong>For learning traders</strong> who want to understand WHY setups work and develop their skills.
                    </p>
                    <ul className={`text-xs space-y-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>✓</span>
                        <span>Educational: 400-600 words with depth</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>✓</span>
                        <span>Plain language explanations & analogies</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>✓</span>
                        <span>Teaches market psychology & concepts</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>✓</span>
                        <span>Step-by-step reasoning & guidance</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Cosmic Overlay Toggle */}
            <button
              onClick={() => setCosmicOverlay(!cosmicOverlay)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 backdrop-blur-sm hover:scale-105 ${
                cosmicOverlay
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                  : darkMode
                    ? 'bg-gray-800/50 border-gray-700 text-gray-500'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
              title="Cosmic Overlay"
            >
              <span className="text-lg">✨</span>
              <span className="text-sm font-medium">Cosmic</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                cosmicOverlay ? 'bg-purple-500/30 text-purple-200' : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>
                {cosmicOverlay ? 'ON' : 'OFF'}
              </span>
            </button>

            <div
              className={`flex-1 relative transition-all duration-200 ${isDragging ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-2xl' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-tour="upload-area"
            >
              <textarea
                data-tour="follow-up-input"
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Describe your trade setup or ask a question... (you can paste images here)"
                disabled={isAnalyzing}
                className={`w-full resize-none rounded-2xl backdrop-blur-xl border px-5 py-4 focus:outline-none focus:ring-2 min-h-[56px] max-h-[200px] transition-all duration-300 ${
                  darkMode
                    ? 'bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-white/5'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
                } disabled:cursor-not-allowed`}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '56px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={isAnalyzing || (!inputMessage.trim() && uploadedImages.length === 0) || !isActiveSubscriber}
              className={`flex-shrink-0 p-3.5 bg-gradient-to-br text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 ${
                darkMode
                  ? 'from-blue-500 to-cyan-500 hover:shadow-cyan-500/50'
                  : 'from-blue-500 to-blue-600 hover:shadow-blue-500/30'
              }`}
              title="Send message"
              data-tour="analyze-button"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className={`mt-3 text-xs text-center font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Press <span className={darkMode ? 'text-cyan-400' : 'text-blue-600'}>Enter</span> to send, <span className={darkMode ? 'text-cyan-400' : 'text-blue-600'}>Shift+Enter</span> for new line • Drag & drop or paste images
          </div>
        </div>
      </div>
    </div>
  );
}

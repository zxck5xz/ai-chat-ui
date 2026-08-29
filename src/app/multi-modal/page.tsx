'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Eye, FileText, ArrowLeftRight, MessageSquare,
  Loader2, Sparkles, Camera, Receipt, Code, BarChart3
} from 'lucide-react';
import { ImageUploader } from '@/components/multi-modal/image-uploader';
import { AnalysisResult } from '@/components/multi-modal/analysis-result';
import { DocumentViewer } from '@/components/multi-modal/document-viewer';
import { ComparisonView } from '@/components/multi-modal/comparison-view';
import { MultiModalChat } from '@/components/multi-modal/multi-modal-chat';
import { useMultiModal } from '@/hooks/use-multi-modal';
import type { AnalysisType, ChatImage } from '@/types/multi-modal';

type Tab = 'analyze' | 'document' | 'compare' | 'chat';

const ANALYSIS_TYPES: { type: AnalysisType; label: string; icon: any; description: string }[] = [
  { type: 'describe', label: 'Describe', icon: Eye, description: 'Detailed image description' },
  { type: 'ocr', label: 'OCR', icon: FileText, description: 'Extract text from image' },
  { type: 'code_screenshot', label: 'Code', icon: Code, description: 'Extract code from screenshot' },
  { type: 'receipt', label: 'Receipt', icon: Receipt, description: 'Parse receipt data' },
  { type: 'chart', label: 'Chart', icon: BarChart3, description: 'Analyze charts/graphs' },
  { type: 'document', label: 'Document', icon: FileText, description: 'Analyze document layout' },
];

export default function MultiModalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
  const [selectedImages, setSelectedImages] = useState<{ base64: string; mimeType: string; name: string }[]>([]);
  const [compareImages, setCompareImages] = useState<{ a?: string; b?: string }>({});
  const [analysisType, setAnalysisType] = useState<AnalysisType>('describe');
  const [customPrompt, setCustomPrompt] = useState('');

  const {
    analysisResult, documentResult, comparisonResult, chatMessages,
    isAnalyzing, isStreaming, streamContent, error,
    analyzeImage, analyzeImageStream, compareImages: compare, understandDocument,
    sendChatMessage, clearResults,
  } = useMultiModal();

  const handleAnalyze = useCallback(async () => {
    if (selectedImages.length === 0) return;
    const img = selectedImages[0];
    await analyzeImageStream(img.base64, img.mimeType, analysisType, customPrompt || undefined);
  }, [selectedImages, analysisType, customPrompt, analyzeImageStream]);

  const handleCompare = useCallback(async () => {
    if (!compareImages.a || !compareImages.b) return;
    // We need both images as base64 - for now use the uploaded ones
  }, [compareImages]);

  const handleDocumentUpload = useCallback(async (files: { base64: string; mimeType: string }[]) => {
    if (files.length === 0) return;
    const file = files[0];
    await understandDocument(file.base64, file.mimeType);
  }, [understandDocument]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'analyze', label: 'Image Analysis', icon: Camera },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <Sparkles size={20} className="text-purple-400" />
          <h1 className="text-lg font-semibold">Multi-Modal AI</h1>
          <Badge variant="outline" className="text-[10px]">Vision + Text</Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 bg-gray-900 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); clearResults(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Input */}
          <div className="space-y-4">
            {activeTab === 'analyze' && (
              <>
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h3 className="text-sm font-medium mb-3">Upload Image</h3>
                  <ImageUploader onImageSelect={setSelectedImages} />
                </Card>

                {selectedImages.length > 0 && (
                  <Card className="p-4 bg-gray-900 border-gray-700">
                    <h3 className="text-sm font-medium mb-3">Analysis Type</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {ANALYSIS_TYPES.map((at) => (
                        <button
                          key={at.type}
                          onClick={() => setAnalysisType(at.type)}
                          className={`flex items-center gap-2 p-2 rounded text-left text-xs transition-colors ${
                            analysisType === at.type
                              ? 'bg-purple-600/20 border border-purple-500 text-purple-300'
                              : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <at.icon size={14} />
                          <div>
                            <div className="font-medium">{at.label}</div>
                            <div className="text-[10px] opacity-70">{at.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3">
                      <input
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Custom prompt (optional)..."
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                      />
                    </div>

                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full mt-3"
                    >
                      {isAnalyzing ? (
                        <><Loader2 size={16} className="mr-2 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles size={16} className="mr-2" /> Analyze Image</>
                      )}
                    </Button>
                  </Card>
                )}

                {/* Image preview */}
                {selectedImages.length > 0 && (
                  <Card className="p-4 bg-gray-900 border-gray-700">
                    <h3 className="text-sm font-medium mb-2">Preview</h3>
                    <img
                      src={`data:${selectedImages[0].mimeType};base64,${selectedImages[0].base64}`}
                      alt="Preview"
                      className="w-full max-h-60 object-contain rounded"
                    />
                  </Card>
                )}
              </>
            )}

            {activeTab === 'document' && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Upload Document</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Upload a PDF or image of a document to extract text, tables, and layout information.
                </p>
                <ImageUploader onImageSelect={handleDocumentUpload} disabled={isAnalyzing} />
                {isAnalyzing && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                    <Loader2 size={16} className="animate-spin" />
                    Processing document...
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'compare' && (
              <Card className="p-4 bg-gray-900 border-gray-700 space-y-3">
                <h3 className="text-sm font-medium">Upload Two Images</h3>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Image A</p>
                  <ImageUploader
                    onImageSelect={(files) => {
                      if (files[0]) setCompareImages((prev) => ({ ...prev, a: files[0].base64 }));
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Image B</p>
                  <ImageUploader
                    onImageSelect={(files) => {
                      if (files[0]) setCompareImages((prev) => ({ ...prev, b: files[0].base64 }));
                    }}
                  />
                </div>
                <Button
                  onClick={handleCompare}
                  disabled={!compareImages.a || !compareImages.b || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Comparing...</>
                  ) : (
                    <><ArrowLeftRight size={16} className="mr-2" /> Compare Images</>
                  )}
                </Button>
              </Card>
            )}

            {activeTab === 'chat' && (
              <Card className="bg-gray-900 border-gray-700 h-[600px]">
                <MultiModalChat
                  messages={chatMessages}
                  onSendMessage={sendChatMessage}
                  isLoading={isAnalyzing}
                />
              </Card>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {error && (
              <Card className="p-4 bg-red-900/20 border-red-800 text-red-300 text-sm">
                {error}
              </Card>
            )}

            {/* Streaming content */}
            {isStreaming && streamContent && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 size={14} className="animate-spin text-purple-400" />
                  <span className="text-xs text-gray-400">Streaming analysis...</span>
                </div>
                <div className="text-sm text-gray-200 whitespace-pre-wrap">{streamContent}</div>
              </Card>
            )}

            {/* Analysis result */}
            {analysisResult && !isStreaming && (
              <AnalysisResult result={analysisResult} />
            )}

            {/* Document result */}
            {documentResult && (
              <DocumentViewer result={documentResult} />
            )}

            {/* Comparison result */}
            {comparisonResult && (
              <ComparisonView
                result={comparisonResult}
                imageUrlA={compareImages.a ? `data:image/*;base64,${compareImages.a}` : undefined}
                imageUrlB={compareImages.b ? `data:image/*;base64,${compareImages.b}` : undefined}
              />
            )}

            {/* Empty state */}
            {!analysisResult && !documentResult && !comparisonResult && !isStreaming && !error && (
              <Card className="p-8 bg-gray-900 border-gray-700 text-center">
                <Sparkles size={48} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 text-sm">
                  {activeTab === 'analyze' && 'Upload an image and select an analysis type'}
                  {activeTab === 'document' && 'Upload a document to extract text and structure'}
                  {activeTab === 'compare' && 'Upload two images to compare them'}
                  {activeTab === 'chat' && 'Start a conversation with images'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

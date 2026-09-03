'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Search,
  FileText,
  Image,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Database,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useMultiModalRAG } from '@/hooks/use-multi-modal-rag';
import type { CrossModalSearchResult } from '@/types/multi-modal-rag';

type Tab = 'search' | 'index' | 'documents' | 'metrics';
type SearchType = 'text-to-image' | 'image-to-text' | 'cross' | 'text-to-text';

export default function CrossModalSearchPage() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('cross');
  const [indexTitle, setIndexTitle] = useState('');
  const [indexContent, setIndexContent] = useState('');
  const [indexType, setIndexType] = useState<'image' | 'text' | 'mixed'>('text');
  const [indexImage, setIndexImage] = useState<{ base64: string; mimeType: string } | null>(null);

  const {
    documents,
    searchResults,
    metrics,
    isLoading,
    error,
    indexDocument,
    search,
    fetchDocuments,
    deleteDocument,
    fetchMetrics,
  } = useMultiModalRAG();

  useEffect(() => {
    if (activeTab === 'documents') fetchDocuments();
    if (activeTab === 'metrics') fetchMetrics();
  }, [activeTab, fetchDocuments, fetchMetrics]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    await search({
      query: searchQuery,
      searchType,
      topK: 10,
    });
  }, [searchQuery, searchType, search]);

  const handleIndex = useCallback(async () => {
    if (!indexTitle.trim() || !indexContent.trim()) return;
    await indexDocument({
      title: indexTitle,
      type: indexType,
      content: indexContent,
      imageBase64: indexImage?.base64,
      mimeType: indexImage?.mimeType,
    });
    setIndexTitle('');
    setIndexContent('');
    setIndexImage(null);
  }, [indexTitle, indexContent, indexType, indexImage, indexDocument]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setIndexImage({ base64, mimeType: file.type });
      setIndexType('image');
    };
    reader.readAsDataURL(file);
  }, []);

  const SEARCH_TYPES: { type: SearchType; label: string; description: string }[] = [
    { type: 'cross', label: 'Cross-Modal', description: 'Text + Image combined search' },
    { type: 'text-to-image', label: 'Text → Image', description: 'Find images matching text' },
    { type: 'image-to-text', label: 'Image → Text', description: 'Find text matching image' },
    { type: 'text-to-text', label: 'Text → Text', description: 'Semantic text search' },
  ];

  const tabs: { id: Tab; label: string; icon: typeof Search }[] = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'index', label: 'Index', icon: Upload },
    { id: 'documents', label: 'Documents', icon: Database },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <Layers size={20} className="text-cyan-400" />
          <h1 className="text-lg font-semibold">Cross-Modal RAG Search</h1>
          <Badge variant="outline" className="text-[10px]">
            Image + Text
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-1 mb-4 bg-gray-900 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {error && (
          <Card className="p-4 mb-4 bg-red-900/20 border-red-800 text-red-300 text-sm">
            {error}
          </Card>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <Card className="p-4 bg-gray-900 border-gray-700">
              <h3 className="text-sm font-medium mb-3">Search Type</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {SEARCH_TYPES.map((st) => (
                  <button
                    key={st.type}
                    onClick={() => setSearchType(st.type)}
                    className={`p-2 rounded text-left text-xs transition-colors ${
                      searchType === st.type
                        ? 'bg-cyan-600/20 border border-cyan-500 text-cyan-300'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{st.label}</div>
                    <div className="text-[10px] opacity-70">{st.description}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Text Query</label>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter search query..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                  />
                </div>

                {(searchType === 'image-to-text' || searchType === 'cross') && (
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Reference Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-700 file:text-white"
                    />
                    {indexImage && (
                      <img
                        src={`data:${indexImage.mimeType};base64,${indexImage.base64}`}
                        alt="Reference"
                        className="mt-2 w-32 h-32 object-contain rounded border border-gray-700"
                      />
                    )}
                  </div>
                )}

                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <Search size={16} className="mr-2" /> Search
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Results */}
            {searchResults.length > 0 && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Results ({searchResults.length})</h3>
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Index Tab */}
        {activeTab === 'index' && (
          <Card className="p-4 bg-gray-900 border-gray-700 space-y-3">
            <h3 className="text-sm font-medium">Index New Document</h3>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Title</label>
              <input
                value={indexTitle}
                onChange={(e) => setIndexTitle(e.target.value)}
                placeholder="Document title..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Type</label>
              <div className="flex gap-2">
                {(['text', 'image', 'mixed'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setIndexType(t)}
                    className={`px-3 py-1.5 rounded text-xs ${
                      indexType === t
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Content / Description</label>
              <textarea
                value={indexContent}
                onChange={(e) => setIndexContent(e.target.value)}
                placeholder="Text content or image description..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
            </div>
            {(indexType === 'image' || indexType === 'mixed') && (
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-700 file:text-white"
                />
                {indexImage && (
                  <img
                    src={`data:${indexImage.mimeType};base64,${indexImage.base64}`}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-contain rounded border border-gray-700"
                  />
                )}
              </div>
            )}
            <Button
              onClick={handleIndex}
              disabled={isLoading || !indexTitle.trim() || !indexContent.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Indexing...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" /> Index Document
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <Card className="p-4 bg-gray-900 border-gray-700">
            <h3 className="text-sm font-medium mb-3">Indexed Documents ({documents.length})</h3>
            {documents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No documents indexed yet</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    {doc.type === 'image' ? (
                      <Image size={16} className="text-cyan-400 shrink-0" />
                    ) : (
                      <FileText size={16} className="text-cyan-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{doc.title}</div>
                      <div className="text-xs text-gray-400 truncate">{doc.content}</div>
                    </div>
                    <Badge className="text-[9px] bg-gray-700">{doc.type}</Badge>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4 bg-gray-900 border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">{metrics.totalDocuments}</div>
              <div className="text-xs text-gray-400">Total Documents</div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">{metrics.totalSearches}</div>
              <div className="text-xs text-gray-400">Total Searches</div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">
                {metrics.avgLatencyMs.toFixed(0)}ms
              </div>
              <div className="text-xs text-gray-400">Avg Latency</div>
            </Card>
            <Card className="p-4 bg-gray-900 border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">
                {Object.keys(metrics.documentsByType).length}
              </div>
              <div className="text-xs text-gray-400">Document Types</div>
            </Card>
            {Object.entries(metrics.documentsByType).map(([type, count]) => (
              <Card key={type} className="p-3 bg-gray-900 border-gray-700">
                <div className="text-lg font-bold text-cyan-300">{count as number}</div>
                <div className="text-xs text-gray-400">{type} documents</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: CrossModalSearchResult }) {
  return (
    <div className="p-3 bg-gray-800 rounded border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        {result.type === 'image' ? (
          <Image size={14} className="text-cyan-400" />
        ) : (
          <FileText size={14} className="text-cyan-400" />
        )}
        <span className="text-sm font-medium">{result.title}</span>
        <Badge className="text-[9px] bg-cyan-900 text-cyan-300">{result.matchType}</Badge>
        <span className="text-[10px] text-gray-500 ml-auto">
          {(result.score * 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">{result.content}</p>
      {result.imageUrl && (
        <img
          src={result.imageUrl}
          alt={result.title}
          className="mt-2 w-24 h-24 object-contain rounded border border-gray-700"
        />
      )}
    </div>
  );
}

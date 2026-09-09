'use client';

import { useEffect, useState } from 'react';
import { useMemory } from '../../hooks/use-memory';
import { TimelineView } from '../../components/memory/timeline-view';
import { GraphView } from '../../components/memory/graph-view';
import { MemorySearch } from '../../components/memory/memory-search';
import { MemoryMetricsDashboard } from '../../components/memory/memory-metrics';
import type { MemorySearchResult } from '../../types/memory';

export default function MemoryPage() {
  const {
    episodicMemories,
    semanticMemories,
    graphNodes,
    graphEdges,
    searchResults,
    metrics,
    forgettingStats,
    loading,
    fetchEpisodic,
    fetchSemantic,
    fetchGraphNodes,
    fetchGraphEdges,
    searchMemory,
    fetchMetrics,
    fetchForgettingStats,
    fetchTimeline,
    createEpisodic,
    createSemantic,
    createGraphNode,
    createGraphEdge,
    consolidate,
    applyDecay,
    prune,
    deleteEpisodic,
    deleteSemantic,
    deleteGraphNode,
  } = useMemory();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'episodic' | 'semantic' | 'graph' | 'search'
  >('overview');
  const [timelineItems, setTimelineItems] = useState<MemorySearchResult[]>([]);

  // New episodic form
  const [epContent, setEpContent] = useState('');
  const [epTopics, setEpTopics] = useState('');
  const [epOutcome, setEpOutcome] = useState<'positive' | 'negative' | 'neutral'>('neutral');

  // New semantic form
  const [semFact, setSemFact] = useState('');
  const [semCategory, setSemCategory] = useState('general');

  // New graph node form
  const [gNodeName, setGNodeName] = useState('');
  const [gNodeType, setGNodeType] = useState('topic');
  const [gNodeDesc, setGNodeDesc] = useState('');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'episodic' as const, label: 'Episodic' },
    { id: 'semantic' as const, label: 'Semantic' },
    { id: 'graph' as const, label: 'Knowledge Graph' },
    { id: 'search' as const, label: 'Search' },
  ];

  useEffect(() => {
    fetchMetrics();
    fetchForgettingStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'episodic') fetchEpisodic();
    if (activeTab === 'semantic') fetchSemantic();
    if (activeTab === 'graph') {
      fetchGraphNodes();
      fetchGraphEdges();
    }
    if (activeTab === 'overview') {
      fetchTimeline(30).then((items) => setTimelineItems(items));
      fetchMetrics();
      fetchForgettingStats();
    }
  }, [activeTab]);

  const handleCreateEpisodic = async () => {
    if (!epContent.trim()) return;
    await createEpisodic({
      content: epContent,
      topics: epTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      outcome: epOutcome,
    });
    setEpContent('');
    setEpTopics('');
  };

  const handleCreateSemantic = async () => {
    if (!semFact.trim()) return;
    await createSemantic({ fact: semFact, category: semCategory });
    setSemFact('');
  };

  const handleCreateGraphNode = async () => {
    if (!gNodeName.trim()) return;
    await createGraphNode({ name: gNodeName, type: gNodeType, description: gNodeDesc });
    setGNodeName('');
    setGNodeDesc('');
  };

  const handleConsolidate = async () => {
    await consolidate();
    fetchMetrics();
    fetchForgettingStats();
  };

  const handleDecay = async () => {
    await applyDecay();
    fetchMetrics();
    fetchForgettingStats();
  };

  const handlePrune = async () => {
    await prune();
    fetchMetrics();
    fetchEpisodic();
    fetchSemantic();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Long-Term Memory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Episodic, Semantic & Knowledge Graph Memory System
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConsolidate}
              disabled={loading}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Consolidate
            </button>
            <button
              onClick={handleDecay}
              disabled={loading}
              className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Apply Decay
            </button>
            <button
              onClick={handlePrune}
              disabled={loading}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Prune Weak
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <MemoryMetricsDashboard metrics={metrics} forgettingStats={forgettingStats} />
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Recent Timeline</h3>
                <TimelineView
                  items={timelineItems}
                  onDelete={(id) => {
                    deleteEpisodic(id);
                    setTimelineItems((prev) => prev.filter((i) => i.id !== id));
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'episodic' && (
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Add Episodic Memory</h3>
                <div className="space-y-3">
                  <textarea
                    value={epContent}
                    onChange={(e) => setEpContent(e.target.value)}
                    placeholder="Describe the interaction or event..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm h-20 resize-none"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={epTopics}
                      onChange={(e) => setEpTopics(e.target.value)}
                      placeholder="Topics (comma-separated)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                    <select
                      value={epOutcome}
                      onChange={(e) =>
                        setEpOutcome(e.target.value as 'positive' | 'negative' | 'neutral')
                      }
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                    </select>
                    <button
                      onClick={handleCreateEpisodic}
                      disabled={loading || !epContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {episodicMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{mem.summary}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              mem.outcome === 'positive'
                                ? 'bg-emerald-100 text-emerald-700'
                                : mem.outcome === 'negative'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {mem.outcome}
                          </span>
                          <span className="text-xs text-gray-400">
                            str: {mem.strength.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">access: {mem.access_count}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEpisodic(mem.id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'semantic' && (
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Add Semantic Memory</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={semFact}
                    onChange={(e) => setSemFact(e.target.value)}
                    placeholder="Enter a fact or knowledge..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                  <input
                    type="text"
                    value={semCategory}
                    onChange={(e) => setSemCategory(e.target.value)}
                    placeholder="Category"
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                  <button
                    onClick={handleCreateSemantic}
                    disabled={loading || !semFact.trim()}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {semanticMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{mem.fact}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            {mem.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            conf: {mem.confidence.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">
                            str: {mem.strength.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">src: {mem.source_type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSemantic(mem.id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Add Graph Node</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={gNodeName}
                    onChange={(e) => setGNodeName(e.target.value)}
                    placeholder="Node name"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                  <select
                    value={gNodeType}
                    onChange={(e) => setGNodeType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="topic">Topic</option>
                    <option value="concept">Concept</option>
                    <option value="entity">Entity</option>
                    <option value="episode">Episode</option>
                  </select>
                  <input
                    type="text"
                    value={gNodeDesc}
                    onChange={(e) => setGNodeDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                  <button
                    onClick={handleCreateGraphNode}
                    disabled={loading || !gNodeName.trim()}
                    className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    Add Node
                  </button>
                </div>
              </div>
              <GraphView
                nodes={graphNodes}
                edges={graphEdges}
                onNodeClick={(node) => {
                  const desc = node.description || '';
                  setGNodeName(node.name);
                  setGNodeType(node.type);
                  setGNodeDesc(desc);
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">Nodes ({graphNodes.length})</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {graphNodes.map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800"
                      >
                        <span>
                          {node.name} <span className="text-gray-400">({node.type})</span>
                        </span>
                        <button
                          onClick={() => deleteGraphNode(node.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">Edges ({graphEdges.length})</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {graphEdges.map((edge) => (
                      <div
                        key={edge.id}
                        className="text-xs py-1 border-b border-gray-100 dark:border-gray-800"
                      >
                        <span className="text-blue-600">
                          {graphNodes.find((n) => n.id === edge.source_node_id)?.name ||
                            edge.source_node_id.slice(0, 8)}
                        </span>
                        <span className="text-gray-400 mx-1">→ {edge.relationship} →</span>
                        <span className="text-emerald-600">
                          {graphNodes.find((n) => n.id === edge.target_node_id)?.name ||
                            edge.target_node_id.slice(0, 8)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <MemorySearch onSearch={searchMemory} results={searchResults} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}

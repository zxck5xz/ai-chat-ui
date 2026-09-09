'use client';

import { useState, useCallback } from 'react';
import type {
  EpisodicMemory,
  SemanticMemory,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  MemorySearchResult,
  MemoryMetrics,
  MemoryAccessLog,
  ForgettingStats,
} from '../types/memory';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function useMemory(userId = 'default') {
  const [episodicMemories, setEpisodicMemories] = useState<EpisodicMemory[]>([]);
  const [semanticMemories, setSemanticMemories] = useState<SemanticMemory[]>([]);
  const [graphNodes, setGraphNodes] = useState<KnowledgeGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([]);
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [accessLogs, setAccessLogs] = useState<MemoryAccessLog[]>([]);
  const [forgettingStats, setForgettingStats] = useState<ForgettingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodic = useCallback(
    async (limit = 50, offset = 0) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/memory/episodic?user_id=${userId}&limit=${limit}&offset=${offset}`
        );
        const data = await res.json();
        setEpisodicMemories(data.memories || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchSemantic = useCallback(
    async (limit = 50, offset = 0) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/memory/semantic?user_id=${userId}&limit=${limit}&offset=${offset}`
        );
        const data = await res.json();
        setSemanticMemories(data.memories || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchGraphNodes = useCallback(
    async (type?: string) => {
      setLoading(true);
      try {
        const url = type
          ? `${API_BASE}/api/memory/graph/nodes?user_id=${userId}&type=${type}`
          : `${API_BASE}/api/memory/graph/nodes?user_id=${userId}`;
        const res = await fetch(url);
        const data = await res.json();
        setGraphNodes(data.nodes || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchGraphEdges = useCallback(
    async (nodeId?: string) => {
      setLoading(true);
      try {
        const url = nodeId
          ? `${API_BASE}/api/memory/graph/edges?user_id=${userId}&node_id=${nodeId}`
          : `${API_BASE}/api/memory/graph/edges?user_id=${userId}`;
        const res = await fetch(url);
        const data = await res.json();
        setGraphEdges(data.edges || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const searchMemory = useCallback(
    async (query: string, limit = 10) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/memory/search?user_id=${userId}&q=${encodeURIComponent(query)}&limit=${limit}`
        );
        const data = await res.json();
        setSearchResults(data.results || []);
        return data.results || [];
      } catch (e) {
        setError(String(e));
        return [];
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/memory/metrics?user_id=${userId}`);
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchTimeline = useCallback(
    async (days = 30) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/memory/timeline?user_id=${userId}&days=${days}`);
        const data = await res.json();
        return data.timeline || [];
      } catch (e) {
        setError(String(e));
        return [];
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchAccessLogs = useCallback(
    async (limit = 50) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/memory/access-log?user_id=${userId}&limit=${limit}`
        );
        const data = await res.json();
        setAccessLogs(data.logs || []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const fetchForgettingStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/memory/forgetting-stats?user_id=${userId}`);
      const data = await res.json();
      setForgettingStats(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createEpisodic = useCallback(
    async (input: {
      content: string;
      summary?: string;
      topics?: string[];
      outcome?: string;
      importance?: number;
    }) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/memory/episodic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ...input }),
        });
        const data = await res.json();
        setEpisodicMemories((prev) => [data, ...prev]);
        return data;
      } catch (e) {
        setError(String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const createSemantic = useCallback(
    async (input: { fact: string; category?: string; confidence?: number }) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/memory/semantic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ...input }),
        });
        const data = await res.json();
        setSemanticMemories((prev) => [data, ...prev]);
        return data;
      } catch (e) {
        setError(String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const createGraphNode = useCallback(
    async (input: { name: string; type: string; description?: string }) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/memory/graph/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ...input }),
        });
        const data = await res.json();
        setGraphNodes((prev) => [data, ...prev]);
        return data;
      } catch (e) {
        setError(String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const createGraphEdge = useCallback(
    async (input: {
      source_node_id: string;
      target_node_id: string;
      relationship: string;
      weight?: number;
    }) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/memory/graph/edges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ...input }),
        });
        const data = await res.json();
        setGraphEdges((prev) => [data, ...prev]);
        return data;
      } catch (e) {
        setError(String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const consolidate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/memory/consolidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      return await res.json();
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const applyDecay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/memory/decay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      return await res.json();
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const prune = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/memory/prune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      return await res.json();
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteEpisodic = useCallback(async (id: string) => {
    await fetch(`${API_BASE}/api/memory/episodic/${id}`, { method: 'DELETE' });
    setEpisodicMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const deleteSemantic = useCallback(async (id: string) => {
    await fetch(`${API_BASE}/api/memory/semantic/${id}`, { method: 'DELETE' });
    setSemanticMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const deleteGraphNode = useCallback(async (id: string) => {
    await fetch(`${API_BASE}/api/memory/graph/nodes/${id}`, { method: 'DELETE' });
    setGraphNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const deleteGraphEdge = useCallback(async (id: string) => {
    await fetch(`${API_BASE}/api/memory/graph/edges/${id}`, { method: 'DELETE' });
    setGraphEdges((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    episodicMemories,
    semanticMemories,
    graphNodes,
    graphEdges,
    searchResults,
    metrics,
    accessLogs,
    forgettingStats,
    loading,
    error,
    fetchEpisodic,
    fetchSemantic,
    fetchGraphNodes,
    fetchGraphEdges,
    searchMemory,
    fetchMetrics,
    fetchTimeline,
    fetchAccessLogs,
    fetchForgettingStats,
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
    deleteGraphEdge,
  };
}

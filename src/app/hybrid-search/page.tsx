'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChunkingComparison } from '@/components/hybrid-search/chunking-comparison';
import { SearchComparison } from '@/components/hybrid-search/search-comparison';
import { EvalMetrics } from '@/components/hybrid-search/eval-metrics';
import { ABTesting } from '@/components/hybrid-search/ab-testing';

export default function HybridSearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Custom RAG + Hybrid Search</h1>
          <p className="text-muted-foreground mt-2">
            BM25 + Vector search, re-ranking, chunking strategies, and evaluation
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Chat</Button>
        </Link>
      </div>

      <Tabs defaultValue="chunking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chunking">Chunking</TabsTrigger>
          <TabsTrigger value="search">Search Compare</TabsTrigger>
          <TabsTrigger value="eval">Evaluation</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="chunking">
          <ChunkingComparison />
        </TabsContent>

        <TabsContent value="search">
          <SearchComparison />
        </TabsContent>

        <TabsContent value="eval">
          <EvalMetrics />
        </TabsContent>

        <TabsContent value="ab-testing">
          <ABTesting />
        </TabsContent>
      </Tabs>

      {/* API Reference */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>Hybrid Search API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/documents</span>
              <span className="text-muted-foreground">- Upload document with chunking</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/search</span>
              <span className="text-muted-foreground">- Hybrid search with re-ranking</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/query</span>
              <span className="text-muted-foreground">- Full RAG query with streaming</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/compare</span>
              <span className="text-muted-foreground">- Compare search methods</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/evaluate</span>
              <span className="text-muted-foreground">- Evaluate search quality</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/chunk</span>
              <span className="text-muted-foreground">- Preview chunking strategies</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                POST
              </Badge>
              <span>/api/hybrid/ab-test</span>
              <span className="text-muted-foreground">- Create A/B test</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                GET
              </Badge>
              <span>/api/hybrid/ab-test/:id/summary</span>
              <span className="text-muted-foreground">- Get A/B test results</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="w-16">
                GET
              </Badge>
              <span>/api/hybrid/stats</span>
              <span className="text-muted-foreground">- Get index statistics</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

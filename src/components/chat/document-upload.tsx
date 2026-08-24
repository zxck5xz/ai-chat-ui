'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface Document {
  id: string;
  title: string;
  url?: string;
  chunk_count: number;
  created_at: string;
}

interface DocumentUploadProps {
  onDocumentUploaded?: () => void;
}

export function DocumentUpload({ onDocumentUploaded }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rag/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
    setIsLoading(false);
  };

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/rag/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          url: url.trim() || undefined,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setUrl('');
        setIsOpen(false);
        loadDocuments();
        onDocumentUploaded?.();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/rag/documents/${id}`, {
        method: 'DELETE',
      });
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) loadDocuments();
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          Documents ({documents.length})
        </Button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Document list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.chunk_count} chunks</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No documents uploaded yet
            </p>
          )}

          {/* Upload form */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            />
            <input
              type="url"
              placeholder="URL (optional)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            />
            <Textarea
              placeholder="Paste document content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] text-sm"
            />
            <Button
              onClick={handleUpload}
              disabled={!title.trim() || !content.trim() || isUploading}
              className="w-full"
              size="sm"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload & Embed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

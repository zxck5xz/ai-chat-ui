'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Type, Loader2, Sparkles, Download, RotateCcw } from 'lucide-react';
import { ImageUploader } from '@/components/multi-modal/image-uploader';
import { TextRegionSelector } from '@/components/image-text-replacement/text-region-selector';
import { ComparisonSlider } from '@/components/image-text-replacement/comparison-slider';
import { useImageTextReplacement } from '@/hooks/use-image-text-replacement';

type Step = 'upload' | 'detect' | 'edit' | 'result';

export default function ImageTextPage() {
  const [step, setStep] = useState<Step>('upload');
  const [sourceImage, setSourceImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string>('');
  const [fontSize, setFontSize] = useState('');
  const [fontColor, setFontColor] = useState('');

  const {
    ocrResult,
    replacementResult,
    selectedRegions,
    isDetecting,
    isReplacing,
    error,
    detectTextRegions,
    selectRegion,
    replaceText,
    clearAll,
  } = useImageTextReplacement();

  const handleImageUpload = useCallback(
    (files: { base64: string; mimeType: string; name: string }[]) => {
      if (files.length === 0) return;
      const file = files[0];
      setSourceImage({ base64: file.base64, mimeType: file.mimeType });
      setSourceImageUrl(`data:${file.mimeType};base64,${file.base64}`);
      setStep('detect');
    },
    []
  );

  const handleDetect = useCallback(async () => {
    if (!sourceImage) return;
    await detectTextRegions(sourceImage.base64, sourceImage.mimeType);
    setStep('edit');
  }, [sourceImage, detectTextRegions]);

  const handleReplace = useCallback(async () => {
    if (!sourceImage) return;
    const style = {
      ...(fontSize && { fontSize }),
      ...(fontColor && { color: fontColor }),
    };
    await replaceText(
      sourceImage.base64,
      sourceImage.mimeType,
      Object.keys(style).length ? style : undefined
    );
    setStep('result');
  }, [sourceImage, fontSize, fontColor, replaceText]);

  const handleDownload = useCallback(() => {
    if (!replacementResult) return;
    const link = document.createElement('a');
    link.href = replacementResult.editedImageUrl;
    link.download = `edited-${Date.now()}.png`;
    link.click();
  }, [replacementResult]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setSourceImage(null);
    setSourceImageUrl('');
    clearAll();
  }, [clearAll]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <Type size={20} className="text-emerald-400" />
          <h1 className="text-lg font-semibold">Image Text Replacement</h1>
          <Badge variant="outline" className="text-[10px]">
            OCR + AI Redraw
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          {(['upload', 'detect', 'edit', 'result'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s
                    ? 'bg-emerald-600 text-white'
                    : ['upload', 'detect', 'edit', 'result'].indexOf(step) > i
                      ? 'bg-emerald-900 text-emerald-300'
                      : 'bg-gray-800 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              <span className={step === s ? 'text-white' : 'text-gray-500'}>
                {s === 'upload'
                  ? 'Upload'
                  : s === 'detect'
                    ? 'Detect'
                    : s === 'edit'
                      ? 'Edit'
                      : 'Result'}
              </span>
              {i < 3 && <div className="w-8 h-px bg-gray-700" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Input / Edit */}
          <div className="space-y-4">
            {step === 'upload' && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Upload Image</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Upload an image with text you want to detect and replace.
                </p>
                <ImageUploader onImageSelect={handleImageUpload} />
              </Card>
            )}

            {step === 'detect' && sourceImageUrl && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Detect Text Regions</h3>
                <img
                  src={sourceImageUrl}
                  alt="Source"
                  className="w-full max-h-60 object-contain rounded mb-3"
                />
                <Button onClick={handleDetect} disabled={isDetecting} className="w-full">
                  {isDetecting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" /> Detecting text...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" /> Detect Text Regions
                    </>
                  )}
                </Button>
              </Card>
            )}

            {step === 'edit' && ocrResult && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Select & Edit Text</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Click on text regions to select and edit them.
                </p>
                <TextRegionSelector
                  imageUrl={sourceImageUrl}
                  regions={ocrResult.regions}
                  selectedRegions={selectedRegions}
                  onRegionSelect={selectRegion}
                />

                {/* Style options */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">
                      Font Size (optional)
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                    >
                      <option value="">Auto</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Color (optional)</label>
                    <input
                      type="color"
                      value={fontColor || '#000000'}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-full h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleReplace}
                    disabled={selectedRegions.size === 0 || isReplacing}
                    className="flex-1"
                  >
                    {isReplacing ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2" /> Replace ({selectedRegions.size})
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw size={14} />
                  </Button>
                </div>
              </Card>
            )}

            {step === 'result' && sourceImageUrl && replacementResult && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Original</h3>
                <img
                  src={sourceImageUrl}
                  alt="Original"
                  className="w-full max-h-60 object-contain rounded"
                />
              </Card>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {error && (
              <Card className="p-4 bg-red-900/20 border-red-800 text-red-300 text-sm">{error}</Card>
            )}

            {/* Edit regions list */}
            {step === 'edit' && ocrResult && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-2">Detected Text</h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {ocrResult.regions.map((region) => {
                    const newText = selectedRegions.get(region.id);
                    return (
                      <div
                        key={region.id}
                        className="flex items-center gap-2 p-2 bg-gray-800 rounded text-xs"
                      >
                        <span className="flex-1 text-gray-300 truncate">{region.text}</span>
                        {newText && <span className="text-emerald-400">→ {newText}</span>}
                        <Badge className="text-[9px] bg-gray-700">
                          {Math.round(region.confidence * 100)}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Comparison slider */}
            {step === 'result' && replacementResult && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Before / After</h3>
                <ComparisonSlider
                  originalImageUrl={replacementResult.originalImageUrl}
                  editedImageUrl={replacementResult.editedImageUrl}
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    <RotateCcw size={14} className="mr-2" /> New Image
                  </Button>
                </div>
              </Card>
            )}

            {/* Empty state */}
            {!ocrResult && !replacementResult && !isDetecting && !error && (
              <Card className="p-8 bg-gray-900 border-gray-700 text-center">
                <Type size={48} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 text-sm">
                  {step === 'upload' && 'Upload an image to detect and replace text'}
                  {step === 'detect' && 'Click detect to find text regions'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

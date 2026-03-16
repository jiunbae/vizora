'use client';

import { useState, useRef } from 'react';
import { MermaidRenderer } from './MermaidRenderer';
import { SvgRenderer } from './SvgRenderer';
import { PlotlyRenderer } from './PlotlyRenderer';
import { Button } from '@/components/ui/button';

interface DiagramViewerProps {
  code: string;
  renderEngine?: 'mermaid' | 'svg' | 'plotly' | 'd3' | 'image';
  isStreaming?: boolean;
  className?: string;
}

export function DiagramViewer({ code, renderEngine = 'mermaid', isStreaming = false, className = '' }: DiagramViewerProps) {
  const [showCode, setShowCode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadSvg = () => {
    if (renderEngine === 'svg') {
      // For SVG engine, download the raw SVG code directly
      let svgCode = code
        .replace(/^```svg\n?/i, '')
        .replace(/^```xml\n?/i, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (renderEngine === 'plotly') {
      // For Plotly, use the built-in export via the mode bar
      // Users can use the camera icon in Plotly's toolbar
      return;
    }

    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = async () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const scale = 2; // 2x for high quality
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'diagram.png';
      a.click();
    };
    img.src = url;
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
  };

  if (!code) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-30">&#9649;</div>
          <p>Enter a prompt to generate a diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            variant={showCode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? 'Preview' : 'Code'}
          </Button>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>
              -
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
              Reset
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopyCode}>
            Copy Code
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownloadSvg}>
            SVG
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownloadPng}>
            PNG
          </Button>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {showCode ? (
          <pre className="text-sm font-mono bg-muted/50 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
            {code}
          </pre>
        ) : (
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            {renderEngine === 'plotly' || renderEngine === 'd3' ? (
              <PlotlyRenderer code={code} className="min-h-[400px]" />
            ) : renderEngine === 'svg' || renderEngine === 'image' ? (
              <SvgRenderer code={code} className="min-h-[200px]" />
            ) : (
              <MermaidRenderer code={code} className="min-h-[200px]" />
            )}
            {isStreaming && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500" />
                Generating...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

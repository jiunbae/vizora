'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export function MermaidRenderer({ code, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const { resolvedTheme } = useTheme();
  const renderIdRef = useRef(0);

  const renderDiagram = useCallback(async () => {
    if (!code.trim() || !containerRef.current) return;

    const currentRenderId = ++renderIdRef.current;
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const mermaid = (await import('mermaid')).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
      });

      // Clean the code
      const cleanCode = code
        .replace(/^```mermaid\n?/i, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      if (!cleanCode) return;

      const id = `mermaid-${currentRenderId}-${Date.now()}`;
      const { svg } = await mermaid.render(id, cleanCode);

      // Only update if this is still the latest render
      if (currentRenderId === renderIdRef.current) {
        setSvgContent(svg);
      }
    } catch (err) {
      if (currentRenderId === renderIdRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    }
  }, [code, resolvedTheme]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 300); // Debounce rendering
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  if (error) {
    return (
      <div className={`p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm ${className}`}>
        <p className="font-medium mb-1">Render Error</p>
        <pre className="text-xs opacity-70 whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-auto ${className}`}
      dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined}
    />
  );
}

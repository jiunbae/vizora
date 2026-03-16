'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

// Publication-quality theme configuration
const ACADEMIC_THEME_LIGHT = {
  theme: 'base' as const,
  themeVariables: {
    // Clean, professional palette inspired by Nature/Science figures
    primaryColor: '#E3F2FD',
    primaryTextColor: '#1a1a2e',
    primaryBorderColor: '#1565C0',
    secondaryColor: '#FFF3E0',
    secondaryTextColor: '#1a1a2e',
    secondaryBorderColor: '#E65100',
    tertiaryColor: '#E8F5E9',
    tertiaryTextColor: '#1a1a2e',
    tertiaryBorderColor: '#2E7D32',
    // Lines and text
    lineColor: '#37474F',
    textColor: '#1a1a2e',
    // Notes and labels
    noteBkgColor: '#FFFDE7',
    noteTextColor: '#1a1a2e',
    noteBorderColor: '#F9A825',
    // Flowchart
    nodeBorder: '#1565C0',
    mainBkg: '#E3F2FD',
    clusterBkg: '#F5F5F5',
    clusterBorder: '#B0BEC5',
    // Sequence diagram
    actorBkg: '#E3F2FD',
    actorBorder: '#1565C0',
    actorTextColor: '#1a1a2e',
    signalColor: '#37474F',
    labelBoxBkgColor: '#ECEFF1',
    // ER diagram
    entityBkg: '#E3F2FD',
    entityBorder: '#1565C0',
  },
};

const ACADEMIC_THEME_DARK = {
  theme: 'base' as const,
  themeVariables: {
    primaryColor: '#1E3A5F',
    primaryTextColor: '#E8EAED',
    primaryBorderColor: '#64B5F6',
    secondaryColor: '#3E2723',
    secondaryTextColor: '#E8EAED',
    secondaryBorderColor: '#FFB74D',
    tertiaryColor: '#1B5E20',
    tertiaryTextColor: '#E8EAED',
    tertiaryBorderColor: '#81C784',
    lineColor: '#B0BEC5',
    textColor: '#E8EAED',
    noteBkgColor: '#3E2723',
    noteTextColor: '#E8EAED',
    noteBorderColor: '#FFB74D',
    nodeBorder: '#64B5F6',
    mainBkg: '#1E3A5F',
    clusterBkg: '#1a1a2e',
    clusterBorder: '#455A64',
    actorBkg: '#1E3A5F',
    actorBorder: '#64B5F6',
    actorTextColor: '#E8EAED',
    signalColor: '#B0BEC5',
    labelBoxBkgColor: '#263238',
    entityBkg: '#1E3A5F',
    entityBorder: '#64B5F6',
  },
};

// Custom CSS for publication quality
const ACADEMIC_CSS = `
  /* Clean, serif-inspired labels */
  .node rect, .node circle, .node polygon, .node ellipse {
    rx: 4px;
    ry: 4px;
    stroke-width: 1.5px !important;
  }
  .edgePath path.path {
    stroke-width: 1.5px !important;
  }
  .label {
    font-size: 13px !important;
    font-weight: 500 !important;
  }
  .edgeLabel {
    font-size: 11px !important;
    background-color: transparent !important;
  }
  .cluster rect {
    rx: 6px !important;
    ry: 6px !important;
    stroke-dasharray: 5 5 !important;
    stroke-width: 1px !important;
  }
  .cluster .nodeLabel {
    font-size: 12px !important;
    font-weight: 600 !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  /* Sequence diagram refinements */
  .actor {
    stroke-width: 1.5px !important;
  }
  .messageLine0, .messageLine1 {
    stroke-width: 1.5px !important;
  }
  text.messageText {
    font-size: 12px !important;
  }
  /* ER diagram */
  .er.entityBox {
    stroke-width: 1.5px !important;
  }
`;

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
      const mermaid = (await import('mermaid')).default;

      const themeConfig = resolvedTheme === 'dark' ? ACADEMIC_THEME_DARK : ACADEMIC_THEME_LIGHT;

      mermaid.initialize({
        startOnLoad: false,
        ...themeConfig,
        securityLevel: 'strict',
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        themeCSS: ACADEMIC_CSS,
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          padding: 15,
          nodeSpacing: 50,
          rankSpacing: 60,
        },
        sequence: {
          diagramMarginX: 20,
          diagramMarginY: 20,
          actorMargin: 80,
          boxMargin: 10,
          boxTextMargin: 8,
          noteMargin: 15,
          messageMargin: 40,
          mirrorActors: true,
          showSequenceNumbers: false,
        },
        er: {
          layoutDirection: 'TB',
          minEntityWidth: 100,
          minEntityHeight: 75,
          entityPadding: 15,
          fontSize: 13,
        },
      });

      const cleanCode = code
        .replace(/^```mermaid\n?/i, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      if (!cleanCode) return;

      const id = `mermaid-${currentRenderId}-${Date.now()}`;
      const { svg } = await mermaid.render(id, cleanCode);

      if (currentRenderId === renderIdRef.current) {
        // Post-process SVG for better quality
        const enhancedSvg = svg
          // Add white background for export
          .replace(
            '<style>',
            `<style>svg { background: transparent; } `
          );
        setSvgContent(enhancedSvg);
      }
    } catch (err) {
      if (currentRenderId === renderIdRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    }
  }, [code, resolvedTheme]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 300);
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

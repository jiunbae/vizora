'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Plotly
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PlotlyRendererProps {
  code: string;
  className?: string;
}

export function PlotlyRenderer({ code, className = '' }: PlotlyRendererProps) {
  const plotConfig = useMemo(() => {
    try {
      // Extract JSON from code (handle markdown fences)
      let jsonStr = code
        .replace(/^```json\n?/i, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      // Try to find JSON object in the code
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        jsonStr = match[0];
      }

      const parsed = JSON.parse(jsonStr);
      return {
        data: parsed.data || [],
        layout: {
          autosize: true,
          paper_bgcolor: 'transparent',
          plot_bgcolor: '#FAFAFA',
          margin: { t: 50, r: 30, b: 60, l: 70 },
          xaxis: {
            gridcolor: '#E0E0E0',
            zerolinecolor: '#BDBDBD',
            ...parsed.layout?.xaxis,
          },
          yaxis: {
            gridcolor: '#E0E0E0',
            zerolinecolor: '#BDBDBD',
            ...parsed.layout?.yaxis,
          },
          ...parsed.layout,
          font: {
            family: 'Inter, Helvetica Neue, Arial, sans-serif',
            size: 13,
            color: '#1a1a2e',
            ...parsed.layout?.font,
          },
        },
      };
    } catch {
      return null;
    }
  }, [code]);

  if (!plotConfig) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
        <p className="text-sm">Failed to parse chart data</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Plot
        data={plotConfig.data}
        layout={plotConfig.layout}
        config={{
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          toImageButtonOptions: {
            format: 'svg',
            filename: 'diagram',
            width: 1200,
            height: 800,
          },
        }}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
    </div>
  );
}

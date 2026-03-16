'use client';

import { useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';

interface SvgRendererProps {
  code: string;
  className?: string;
}

export function SvgRenderer({ code, className = '' }: SvgRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedSvg = useMemo(() => {
    if (!code.trim()) return '';

    // Extract SVG content - handle both raw SVG and code blocks
    let svgCode = code
      .replace(/^```svg\n?/i, '')
      .replace(/^```xml\n?/i, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    // If the code doesn't start with <svg, try to find SVG in it
    if (!svgCode.startsWith('<svg')) {
      const match = svgCode.match(/<svg[\s\S]*<\/svg>/i);
      if (match) {
        svgCode = match[0];
      }
    }

    // Sanitize to prevent XSS but allow SVG elements
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(svgCode, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use', 'pattern', 'marker', 'defs', 'clipPath', 'mask',
                   'linearGradient', 'radialGradient', 'stop', 'filter',
                   'feGaussianBlur', 'feOffset', 'feMerge', 'feMergeNode',
                   'feFlood', 'feComposite', 'feBlend'],
        ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width',
                   'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
                   'transform', 'opacity', 'font-family', 'font-size',
                   'font-weight', 'text-anchor', 'dominant-baseline',
                   'marker-end', 'marker-start', 'cx', 'cy', 'r', 'rx', 'ry',
                   'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height',
                   'd', 'points', 'offset', 'stop-color', 'stop-opacity',
                   'gradientUnits', 'gradientTransform', 'patternUnits'],
      });
    }
    return svgCode;
  }, [code]);

  if (!sanitizedSvg) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
        <p className="text-sm">No SVG content to display</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-auto [&>svg]:max-w-full [&>svg]:h-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
}

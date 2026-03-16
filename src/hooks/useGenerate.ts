'use client';

import { useState, useCallback, useRef } from 'react';
import { DiagramType, ClassificationResult, StreamEvent } from '@/types/diagram';

interface UseGenerateReturn {
  code: string;
  status: 'idle' | 'classifying' | 'generating' | 'validating' | 'complete' | 'error';
  classification: ClassificationResult | null;
  error: string | null;
  generate: (prompt: string, diagramType?: DiagramType) => Promise<void>;
  cancel: () => void;
}

export function useGenerate(): UseGenerateReturn {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<UseGenerateReturn['status']>('idle');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus('idle');
  }, []);

  const generate = useCallback(async (prompt: string, diagramType?: DiagramType) => {
    // Cancel any existing request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCode('');
    setError(null);
    setClassification(null);
    setStatus('classifying');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, diagramType }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const event: StreamEvent = JSON.parse(line.slice(6));

            switch (event.phase) {
              case 'classifying':
                setStatus('classifying');
                if (event.classification) {
                  setClassification(event.classification);
                }
                break;
              case 'generating':
                setStatus('generating');
                if (event.data) {
                  setCode(event.data);
                }
                break;
              case 'validating':
                setStatus('validating');
                break;
              case 'complete':
                if (event.code) setCode(event.code);
                if (event.classification) setClassification(event.classification);
                setStatus('complete');
                break;
              case 'error':
                setError(event.error || 'Unknown error');
                setStatus('error');
                break;
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // User cancelled
      }
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    }
  }, []);

  return { code, status, classification, error, generate, cancel };
}

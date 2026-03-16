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

  const processEvent = useCallback((event: StreamEvent) => {
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
  }, []);

  const generate = useCallback(async (prompt: string, diagramType?: DiagramType) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCode('');
    setError(null);
    setClassification(null);
    setStatus('classifying');

    try {
      console.log('[useGenerate] Starting fetch to /api/generate');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, diagramType }),
        signal: controller.signal,
      });

      console.log('[useGenerate] Response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      console.log('[useGenerate] Reader obtained, starting stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process all complete SSE messages in buffer
        // SSE messages end with \n\n
        let doubleNewline = buffer.indexOf('\n\n');
        while (doubleNewline !== -1) {
          const message = buffer.slice(0, doubleNewline);
          buffer = buffer.slice(doubleNewline + 2);

          // Parse each line of the message
          for (const line of message.split('\n')) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const event: StreamEvent = JSON.parse(trimmed.slice(6));
                console.log('[useGenerate] Event:', event.phase);
                processEvent(event);
              } catch (e) {
                console.warn('[useGenerate] Malformed SSE:', trimmed, e);
              }
            }
          }

          doubleNewline = buffer.indexOf('\n\n');
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        for (const line of buffer.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event: StreamEvent = JSON.parse(trimmed.slice(6));
              processEvent(event);
            } catch {
              // skip
            }
          }
        }
      }
    } catch (err) {
      console.error('[useGenerate] Error:', err);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    }
  }, [processEvent]);

  return { code, status, classification, error, generate, cancel };
}

'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles, ArrowRight, Search, CheckCircle, AlertCircle, Loader2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DIAGRAM_LABELS, type DiagramType } from '@/types/diagram';
import { DiagramViewer } from '@/components/diagram/DiagramViewer';
import { useGenerate } from '@/hooks/useGenerate';

const PHASE_LABELS: Record<string, { label: string; icon: typeof Search }> = {
  classifying: { label: 'Classifying diagram type...', icon: Search },
  generating: { label: 'Generating diagram code...', icon: Loader2 },
  validating: { label: 'Validating output...', icon: CheckCircle },
  complete: { label: 'Generation complete', icon: CheckCircle },
  error: { label: 'Error occurred', icon: AlertCircle },
};

const TEMPLATE_GROUPS = {
  software: {
    label: 'Software',
    types: ['flowchart', 'sequence', 'class', 'er', 'state'] as DiagramType[],
  },
  math_science: {
    label: 'Math / Science',
    types: ['math_graph', 'network', 'chemical', 'circuit'] as DiagramType[],
  },
  biology: {
    label: 'Biology / Visual',
    types: ['anatomy', 'illustration'] as DiagramType[],
  },
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<DiagramType | null>(null);
  const { code, status, error, generate, cancel } = useGenerate();

  const isGenerating = status === 'classifying' || status === 'generating' || status === 'validating';
  const phase = status === 'idle' ? null : status;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    console.log('[page] handleGenerate called, prompt:', prompt.slice(0, 50));
    generate(prompt, selectedType || undefined).catch((err) => {
      console.error('[page] generate error:', err);
    });
  };

  const handleTemplateClick = (type: DiagramType) => {
    setSelectedType((prev) => (prev === type ? null : type));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">STEM Visualizer</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Left Panel - Input */}
        <div className="flex w-full flex-col gap-4 lg:w-[420px] lg:shrink-0">
          {/* Prompt Input */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-4">
              <label htmlFor="prompt-input" className="text-sm font-medium text-muted-foreground">
                Describe the diagram you want to create
              </label>
              <Textarea
                id="prompt-input"
                placeholder="e.g. Draw a flowchart for user authentication with OAuth2..."
                className="min-h-[140px] resize-none text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />
              {isGenerating ? (
                <Button
                  className="w-full"
                  size="lg"
                  variant="destructive"
                  onClick={cancel}
                >
                  Stop
                  <Square className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                >
                  Generate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Bar */}
          {phase && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {(() => {
                const phaseInfo = PHASE_LABELS[phase];
                if (!phaseInfo) return null;
                const Icon = phaseInfo.icon;
                return (
                  <>
                    <Icon className={`h-4 w-4 ${phase === 'generating' || phase === 'classifying' ? 'animate-spin' : ''}`} />
                    <span>{phaseInfo.label}</span>
                  </>
                );
              })()}
            </div>
          )}

          {/* Template Quick-Select */}
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <span className="text-sm font-medium text-muted-foreground">
                Diagram type templates
              </span>
              <Tabs defaultValue="software" className="w-full">
                <TabsList className="w-full">
                  {Object.entries(TEMPLATE_GROUPS).map(([key, group]) => (
                    <TabsTrigger key={key} value={key} className="flex-1 text-xs">
                      {group.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(TEMPLATE_GROUPS).map(([key, group]) => (
                  <TabsContent key={key} value={key} className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {group.types.map((type) => {
                        const info = DIAGRAM_LABELS[type];
                        const isActive = selectedType === type;
                        return (
                          <Badge
                            key={type}
                            variant={isActive ? 'default' : 'outline'}
                            className="cursor-pointer select-none px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleTemplateClick(type)}
                          >
                            {info.label}
                          </Badge>
                        );
                      })}
                    </div>
                    {selectedType && group.types.includes(selectedType) && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {DIAGRAM_LABELS[selectedType].description}
                      </p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Output */}
        <div className="flex flex-1">
          <Card className="flex h-full min-h-[400px] w-full overflow-hidden lg:min-h-0">
            {code || isGenerating ? (
              <DiagramViewer
                code={code}
                isStreaming={status === 'generating'}
                className="w-full"
              />
            ) : (
              <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter a prompt to generate a diagram
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Supports flowcharts, sequence diagrams, ER diagrams, math graphs, and more
                </p>
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

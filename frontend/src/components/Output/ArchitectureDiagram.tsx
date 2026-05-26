import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, CheckCircle } from 'lucide-react';

interface Props {
  diagram: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { curve: 'basis' },
});

export default function ArchitectureDiagram({ diagram }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current || !diagram) return;
      setError(null);
      try {
        containerRef.current.innerHTML = '';
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagram);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e) {
        setError('Failed to render diagram. The diagram source is shown below.');
        console.error('Mermaid render error:', e);
      }
    };
    render();
  }, [diagram]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Architecture Diagram</h3>
          <p className="text-xs text-gray-500 mt-0.5">Entity relationship visualization</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? 'Copied!' : 'Copy Mermaid'}
        </button>
      </div>

      {/* Rendered diagram */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-64 flex items-center justify-center overflow-x-auto">
        {error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div ref={containerRef} className="w-full overflow-x-auto" />
        )}
      </div>

      {/* Mermaid source */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Mermaid Source
        </h4>
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap">
          {diagram}
        </pre>
      </div>
    </div>
  );
}

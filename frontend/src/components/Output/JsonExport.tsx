import React, { useState } from 'react';
import { Copy, Download, CheckCircle } from 'lucide-react';

interface Props {
  jsonData: Record<string, unknown>;
}

export default function JsonExport({ jsonData }: Props) {
  const [copied, setCopied] = useState(false);
  const jsonStr = JSON.stringify(jsonData, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xdm-schemas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-gray-800">Deployable JSON Schema</h3>
          <p className="text-xs text-gray-500 mt-0.5">AEP-compatible XDM schema definitions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-adobe-navy hover:bg-adobe-dark text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Code block */}
      <div className="flex-1 bg-gray-900 rounded-xl overflow-auto min-h-0">
        <pre className="text-xs text-green-400 p-4 font-mono leading-relaxed whitespace-pre-wrap break-all">
          {jsonStr}
        </pre>
      </div>
    </div>
  );
}

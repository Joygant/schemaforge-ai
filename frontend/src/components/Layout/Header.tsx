import React from 'react';
import { Database, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onNewSession: (() => void) | null;
  sessionStatus?: string;
}

export default function Header({ onNewSession, sessionStatus }: HeaderProps) {
  const statusColors: Record<string, string> = {
    discovery: 'bg-blue-100 text-blue-700',
    extracting: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-orange-100 text-orange-700',
    complete: 'bg-green-100 text-green-700',
  };

  const statusLabels: Record<string, string> = {
    discovery: 'Discovery',
    extracting: 'Analyzing...',
    ready: 'Ready to Generate',
    complete: 'Complete',
  };

  return (
    <header className="bg-adobe-navy text-white px-6 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-adobe-red rounded p-1.5">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg">XDM Designer</span>
          <span className="text-gray-400 text-sm ml-2">for Adobe Experience Platform</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {sessionStatus && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              statusColors[sessionStatus] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {statusLabels[sessionStatus] || sessionStatus}
          </span>
        )}
        {onNewSession && (
          <button
            onClick={onNewSession}
            className="flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Session
          </button>
        )}
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { FileText, Grid3X3, Database, Code, GitBranch, Star } from 'lucide-react';
import BusinessSummary from './BusinessSummary';
import EntityModel from './EntityModel';
import XDMDesign from './XDMDesign';
import JsonExport from './JsonExport';
import ArchitectureDiagram from './ArchitectureDiagram';
import type { XDMOutput, Session } from '../../types';

interface OutputPanelProps {
  xdmOutput: XDMOutput | null;
  session: Session;
}

const TABS = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'entities', label: 'Entities', icon: Grid3X3 },
  { id: 'xdm', label: 'XDM Design', icon: Database },
  { id: 'json', label: 'JSON', icon: Code },
  { id: 'diagram', label: 'Diagram', icon: GitBranch },
];

export default function OutputPanel({ xdmOutput, session: _session }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!xdmOutput) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">XDM Design Output</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Complete the discovery conversation on the left. Once the AI has gathered enough
            information about your business, click "Generate XDM Design" to see your schemas here.
          </p>
          <div className="mt-6 space-y-2">
            {[
              'Business Summary',
              'Entity Model',
              'XDM Schemas',
              'JSON Export',
              'Architecture Diagram',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Quality score badge */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-medium text-gray-700">
          {xdmOutput.xdm_design.totalSchemas} Schemas Generated
        </span>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-gray-800">{xdmOutput.quality_score.overall}/100</span>
          <span className="text-xs text-gray-500">Quality Score</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto flex-shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-adobe-red text-adobe-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' && (
          <BusinessSummary
            summary={xdmOutput.business_summary}
            qualityScore={xdmOutput.quality_score}
          />
        )}
        {activeTab === 'entities' && <EntityModel model={xdmOutput.entity_model} />}
        {activeTab === 'xdm' && <XDMDesign design={xdmOutput.xdm_design} />}
        {activeTab === 'json' && <JsonExport jsonData={xdmOutput.json_export} />}
        {activeTab === 'diagram' && <ArchitectureDiagram diagram={xdmOutput.architecture_diagram} />}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Database } from 'lucide-react';
import type { XDMDesign as XDMDesignType, XDMSchema } from '../../types';

interface Props {
  design: XDMDesignType;
}

function SchemaCard({ schema }: { schema: XDMSchema }) {
  const [expanded, setExpanded] = useState(false);
  const isProfile = schema.xdmClass === 'XDM Individual Profile';

  return (
    <div
      className={`border rounded-xl overflow-hidden mb-4 ${
        isProfile ? 'border-orange-200' : 'border-blue-200'
      }`}
    >
      {/* Card header / toggle */}
      <button
        className={`w-full flex items-center justify-between p-4 text-left ${
          isProfile ? 'bg-orange-50' : 'bg-blue-50'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-gray-900">{schema.schemaName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isProfile
                  ? 'bg-orange-200 text-orange-800'
                  : 'bg-blue-200 text-blue-800'
              }`}
            >
              {isProfile ? 'XDM Individual Profile' : 'XDM ExperienceEvent'}
            </span>
            {schema.profileEnabled && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> Profile Enabled
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">{schema.description}</p>

          {/* Fields table */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Fields
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 font-medium text-gray-600">Field</th>
                    <th className="p-2 font-medium text-gray-600">Type</th>
                    <th className="p-2 font-medium text-gray-600">Required</th>
                    <th className="p-2 font-medium text-gray-600">Identity</th>
                    <th className="p-2 font-medium text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(schema.fields).map(([name, def]) => (
                    <tr key={name} className={def.identity ? 'bg-yellow-50' : ''}>
                      <td className="p-2 font-mono font-medium text-gray-800">{name}</td>
                      <td className="p-2 text-gray-600">{def.type}</td>
                      <td className="p-2">{def.required ? '✓' : '–'}</td>
                      <td className="p-2">
                        {def.identity ? (
                          <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-xs">
                            {def.identityNamespace}
                          </span>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="p-2 text-gray-500 max-w-xs truncate">{def.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field groups + ingestion */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Field Groups
              </h4>
              <ul className="space-y-1">
                {schema.fieldGroups.map(fg => (
                  <li key={fg} className="text-xs text-gray-600 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0"></div>
                    {fg}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Database className="w-3 h-3 inline mr-1" />
                Ingestion
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Sources:</strong> {schema.ingestionRecommendation.sources.join(', ')}
                </p>
                <p>
                  <strong>Methods:</strong> {schema.ingestionRecommendation.methods.join(', ')}
                </p>
                <p>
                  <strong>Frequency:</strong> {schema.ingestionRecommendation.frequency}
                </p>
              </div>
            </div>
          </div>

          {/* Profile enablement reason */}
          <div
            className={`text-xs p-3 rounded-lg ${
              schema.profileEnabled
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            <strong>Profile Enablement:</strong> {schema.profileEnablementReason}
          </div>
        </div>
      )}
    </div>
  );
}

export default function XDMDesign({ design }: Props) {
  return (
    <div className="p-6">
      {/* Identity strategy */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-1">Identity Strategy</h3>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p className="mb-2">{design.identityStrategy.description}</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <span>
              <strong>Primary:</strong> {design.identityStrategy.primary.join(', ')}
            </span>
            <span>
              <strong>Secondary:</strong> {design.identityStrategy.secondary.join(', ')}
            </span>
            <span>
              <strong>Device:</strong> {design.identityStrategy.device.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Relationships */}
      {design.relationships.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Relationships</h3>
          <div className="space-y-1">
            {design.relationships.map((rel, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
              >
                <span className="font-medium text-gray-800">{rel.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-gray-800">{rel.to}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-1">
                  {rel.type}
                </span>
                <span className="text-gray-500 text-xs ml-auto">{rel.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema cards */}
      <h3 className="font-semibold text-gray-800 mb-3">
        Schemas ({design.schemas.length})
      </h3>
      {design.schemas.map(schema => (
        <SchemaCard key={schema.schemaName} schema={schema} />
      ))}
    </div>
  );
}

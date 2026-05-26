import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { EntityModel as EntityModelType } from '../../types';

interface Props {
  model: EntityModelType;
}

export default function EntityModel({ model }: Props) {
  return (
    <div className="p-6">
      {/* Stats row */}
      <div className="flex gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex-1 text-center">
          <div className="text-2xl font-bold text-orange-600">{model.profileEntities}</div>
          <div className="text-xs text-gray-600">Profile Schemas</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex-1 text-center">
          <div className="text-2xl font-bold text-blue-600">{model.eventEntities}</div>
          <div className="text-xs text-gray-600">Event Schemas</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex-1 text-center">
          <div className="text-2xl font-bold text-gray-700">{model.totalEntities}</div>
          <div className="text-xs text-gray-600">Total Entities</div>
        </div>
      </div>

      {/* Entity table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="pb-3 font-semibold text-gray-700">Entity</th>
              <th className="pb-3 font-semibold text-gray-700">XDM Class</th>
              <th className="pb-3 font-semibold text-gray-700 text-center">Profile</th>
              <th className="pb-3 font-semibold text-gray-700">Key Fields</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {model.entities.map(entity => (
              <tr key={entity.entity} className="hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <div className="font-medium text-gray-900">{entity.entity}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{entity.description}</div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      entity.xdmClass === 'XDM Individual Profile'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {entity.xdmClass === 'XDM Individual Profile' ? 'Profile' : 'Event'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-center">
                  {entity.profileEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {entity.keyFields.slice(0, 3).map(f => (
                      <span
                        key={f}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono"
                      >
                        {f}
                      </span>
                    ))}
                    {entity.keyFields.length > 3 && (
                      <span className="text-xs text-gray-400">+{entity.keyFields.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

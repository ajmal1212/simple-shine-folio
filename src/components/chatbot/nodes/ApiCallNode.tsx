import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

interface ApiCallNodeProps {
  data: {
    label: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
}

export const ApiCallNode: React.FC<ApiCallNodeProps> = memo(({ data }) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600';
      case 'POST': return 'text-green-600';
      case 'PUT': return 'text-yellow-600';
      case 'DELETE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-background border-2 border-indigo-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
          <Globe className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label}</h3>
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-indigo-500">
        <div className={`text-xs font-semibold ${getMethodColor(data.method)} mb-1`}>
          {data.method}
        </div>
        <div className="text-xs font-mono break-all">
          {data.url || 'Enter API URL...'}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </div>
  );
});
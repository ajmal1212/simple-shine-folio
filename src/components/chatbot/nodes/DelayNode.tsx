import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

interface DelayNodeProps {
  data: {
    label: string;
    duration: number;
  };
}

export const DelayNode: React.FC<DelayNodeProps> = memo(({ data }) => {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div className="bg-background border-2 border-yellow-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center">
          <Clock className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label}</h3>
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-yellow-500">
        Wait: <span className="font-mono">{formatDuration(data.duration || 1000)}</span>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
    </div>
  );
});
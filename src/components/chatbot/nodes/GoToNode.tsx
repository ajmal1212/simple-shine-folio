import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

interface GoToNodeProps {
  data: {
    label: string;
    targetBlockId: string;
  };
}

export const GoToNode: React.FC<GoToNodeProps> = memo(({ data }) => {
  return (
    <div className="bg-background border-2 border-orange-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label}</h3>
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-orange-500">
        Jump to: <span className="font-mono">{data.targetBlockId || 'Select block'}</span>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </div>
  );
});
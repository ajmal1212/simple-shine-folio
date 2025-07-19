import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Keyboard } from 'lucide-react';

interface UserInputNodeProps {
  data: {
    label: string;
    inputType: 'text' | 'number' | 'email' | 'quickReplies';
    variable: string;
    quickReplies?: Array<{ text: string; value: string }>;
  };
}

export const UserInputNode: React.FC<UserInputNodeProps> = memo(({ data }) => {
  return (
    <div className="bg-background border-2 border-green-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
          <Keyboard className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label}</h3>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        Type: {data.inputType}
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-green-500">
        Save to: <span className="font-mono">{`{{${data.variable}}}`}</span>
      </div>
      
      {data.quickReplies && data.quickReplies.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Quick Replies:</div>
          {data.quickReplies.slice(0, 2).map((reply, index) => (
            <div key={index} className="text-xs bg-green-50 px-2 py-1 rounded mb-1">
              {reply.text}
            </div>
          ))}
          {data.quickReplies.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{data.quickReplies.length - 2} more
            </div>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
});
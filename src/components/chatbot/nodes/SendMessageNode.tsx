
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

interface SendMessageNodeProps {
  data: {
    label: string;
    message: string;
    messageType: 'text' | 'image' | 'buttons';
    buttons?: Array<{ text: string; value: string }>;
  };
}

export const SendMessageNode: React.FC<SendMessageNodeProps> = memo(({ data }) => {
  const getDisplayMessage = () => {
    if (!data.message || data.message.trim() === '') {
      return 'No message content';
    }
    return data.message.length > 50 ? `${data.message.substring(0, 50)}...` : data.message;
  };

  return (
    <div className="bg-background border-2 border-blue-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label || 'Send Message'}</h3>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        Type: {data.messageType || 'text'}
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-blue-500">
        {getDisplayMessage()}
      </div>
      
      {data.buttons && data.buttons.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Buttons:</div>
          {data.buttons.slice(0, 2).map((button, index) => (
            <div key={index} className="text-xs bg-blue-50 px-2 py-1 rounded mb-1">
              {button.text || 'Button'}
            </div>
          ))}
          {data.buttons.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{data.buttons.length - 2} more
            </div>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
});

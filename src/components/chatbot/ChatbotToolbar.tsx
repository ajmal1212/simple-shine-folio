import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Upload, Play, ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface ChatbotToolbarProps {
  onSave: () => void;
  onLoad: () => void;
}

export const ChatbotToolbar: React.FC<ChatbotToolbarProps> = ({ onSave, onLoad }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="bg-background border rounded-lg shadow-sm p-2 flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onSave}>
        <Save className="w-4 h-4 mr-1" />
        Save
      </Button>
      
      <Button variant="outline" size="sm" onClick={onLoad}>
        <Upload className="w-4 h-4 mr-1" />
        Load
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button variant="outline" size="sm">
        <RotateCcw className="w-4 h-4 mr-1" />
        Undo
      </Button>
      
      <Button variant="outline" size="sm">
        <RotateCw className="w-4 h-4 mr-1" />
        Redo
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button variant="outline" size="sm" onClick={() => zoomIn()}>
        <ZoomIn className="w-4 h-4" />
      </Button>
      
      <Button variant="outline" size="sm" onClick={() => zoomOut()}>
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <Button variant="outline" size="sm" onClick={() => fitView()}>
        Fit
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button variant="default" size="sm">
        <Play className="w-4 h-4 mr-1" />
        Preview
      </Button>
    </div>
  );
};
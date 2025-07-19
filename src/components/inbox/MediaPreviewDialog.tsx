
import React from 'react';
import { Send, X, FileText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface MediaPreview {
  file: File;
  type: 'image' | 'document' | 'video' | 'audio';
  preview?: string;
}

interface MediaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaPreview: MediaPreview | null;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onSend: () => void;
  isUploading: boolean;
}

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  isOpen,
  onClose,
  mediaPreview,
  caption,
  onCaptionChange,
  onSend,
  isUploading
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'audio': return <Mic className="w-8 h-8 text-green-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Send {mediaPreview?.type}</DialogTitle>
        </DialogHeader>
        
        {mediaPreview && (
          <div className="space-y-4">
            <div className="border rounded-xl p-4 bg-gray-50">
              {mediaPreview.type === 'image' && mediaPreview.preview && (
                <img
                  src={mediaPreview.preview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 object-contain mx-auto rounded-lg"
                />
              )}
              
              {mediaPreview.type === 'video' && mediaPreview.preview && (
                <video
                  src={mediaPreview.preview}
                  controls
                  className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                />
              )}
              
              {(mediaPreview.type === 'document' || mediaPreview.type === 'audio') && (
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                  {getIcon(mediaPreview.type)}
                  <div>
                    <p className="font-medium text-gray-900">{mediaPreview.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(mediaPreview.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {(mediaPreview.type === 'image' || mediaPreview.type === 'video' || mediaPreview.type === 'document') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Caption (optional)</label>
                <Textarea
                  value={caption}
                  onChange={(e) => onCaptionChange(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                  className="resize-none border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={onSend}
                disabled={isUploading}
                className="whatsapp-green hover:bg-green-600 px-6"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

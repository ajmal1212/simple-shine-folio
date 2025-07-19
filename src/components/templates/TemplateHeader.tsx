
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TemplateHeaderProps {
  headerType: string;
  headerContent: string;
  headerHandle: string;
  headerMediaFile: File | null;
  uploadStatus: string;
  uploadError: string;
  uploadSessionId: string;
  isUploading: boolean;
  onHeaderTypeChange: (type: string) => void;
  onHeaderContentChange: (content: string) => void;
  onMediaFileSelect: (file: File) => void;
  onResumeUpload: () => void;
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  headerType,
  headerContent,
  headerHandle,
  headerMediaFile,
  uploadStatus,
  uploadError,
  uploadSessionId,
  isUploading,
  onHeaderTypeChange,
  onHeaderContentChange,
  onMediaFileSelect,
  onResumeUpload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Header (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="header-type" className="text-sm">Header Type</Label>
          <Select 
            value={headerType} 
            onValueChange={onHeaderTypeChange}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None</SelectItem>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="IMAGE">Image</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="DOCUMENT">Document</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {headerType && headerType !== 'NONE' && (
          <>
            {headerType === 'TEXT' ? (
              <div>
                <Label htmlFor="header-content" className="text-sm">Header Text</Label>
                <Input
                  id="header-content"
                  value={headerContent}
                  onChange={(e) => onHeaderContentChange(e.target.value)}
                  placeholder="Header text"
                  className="text-sm"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm">Upload {headerType}</Label>
                <input
                  type="file"
                  accept={headerType === 'IMAGE' ? 'image/*' : headerType === 'VIDEO' ? 'video/*' : '*/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onMediaFileSelect(file);
                    }
                  }}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                />
                
                {/* Enhanced Upload Status Display */}
                {(uploadStatus || uploadError) && (
                  <div className={`p-4 rounded-lg border ${
                    uploadError ? 'bg-red-50 border-red-200' : 
                    uploadStatus.includes('✅') ? 'bg-green-50 border-green-200' : 
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isUploading && (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <p className={`text-sm font-medium ${
                          uploadError ? 'text-red-700' : 
                          uploadStatus.includes('✅') ? 'text-green-700' : 
                          'text-blue-700'
                        }`}>
                          {uploadStatus || uploadError}
                        </p>
                      </div>
                      
                      {/* Resume Upload Button */}
                      {uploadSessionId && uploadError && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onResumeUpload}
                          disabled={isUploading}
                          className="text-xs h-8"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Resume Upload
                        </Button>
                      )}
                    </div>
                    
                    {/* Show upload session ID for debugging */}
                    {uploadSessionId && (
                      <p className="text-xs text-gray-500 mt-2 break-all">
                        Session ID: {uploadSessionId}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Show preview and header handle */}
                {headerContent && (
                  <div className="space-y-2">
                    {headerType === 'IMAGE' && (
                      <img src={headerContent} alt="Header preview" className="max-w-32 max-h-32 object-cover rounded border" />
                    )}
                    <p className="text-xs text-gray-500">
                      {headerMediaFile ? `File: ${headerMediaFile.name}` : 'Preview'}
                    </p>
                  </div>
                )}
                
                {/* Header Handle Display */}
                {headerHandle && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Label className="text-sm font-medium text-green-800">Header Handle (Ready for WhatsApp):</Label>
                    <div className="mt-2 p-3 bg-white border rounded text-xs font-mono break-all text-green-700 max-h-32 overflow-y-auto">
                      {headerHandle}
                    </div>
                    <p className="text-xs text-green-600 mt-2">✅ Media uploaded successfully and ready for template submission</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

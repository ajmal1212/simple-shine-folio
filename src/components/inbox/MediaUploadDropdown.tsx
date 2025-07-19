
import React from 'react';
import { Paperclip, Image, FileText, Video, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MediaUploadDropdownProps {
  onFileTypeSelect: (accept: string) => void;
}

export const MediaUploadDropdown: React.FC<MediaUploadDropdownProps> = ({ onFileTypeSelect }) => {
  const mediaOptions = [
    {
      label: 'Photos',
      icon: <Image className="w-4 h-4 text-blue-600" />,
      accept: 'image/*',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Videos',
      icon: <Video className="w-4 h-4 text-green-600" />,
      accept: 'video/*',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Documents',
      icon: <FileText className="w-4 h-4 text-orange-600" />,
      accept: '.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Audio',
      icon: <Mic className="w-4 h-4 text-purple-600" />,
      accept: 'audio/*',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Files',
      icon: <Paperclip className="w-4 h-4 text-gray-600" />,
      accept: '*/*',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-48">
        {mediaOptions.map((option) => (
          <DropdownMenuItem 
            key={option.label}
            onClick={() => onFileTypeSelect(option.accept)}
            className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50"
          >
            <div className={`w-8 h-8 ${option.bgColor} rounded-full flex items-center justify-center`}>
              {option.icon}
            </div>
            <span className="text-gray-700">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

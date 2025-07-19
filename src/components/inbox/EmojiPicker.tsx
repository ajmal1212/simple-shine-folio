
import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerComponentProps {
  onEmojiClick: (emoji: string) => void;
}

export const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({ onEmojiClick }) => {
  const handleEmojiClick = (emojiData: any) => {
    onEmojiClick(emojiData.emoji);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="top" align="start">
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </PopoverContent>
    </Popover>
  );
};

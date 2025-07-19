
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateFooterProps {
  footerText: string;
  onFooterTextChange: (text: string) => void;
}

export const TemplateFooter: React.FC<TemplateFooterProps> = ({
  footerText,
  onFooterTextChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Footer (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          value={footerText}
          onChange={(e) => onFooterTextChange(e.target.value)}
          placeholder="Optional footer text"
          className="text-sm"
        />
      </CardContent>
    </Card>
  );
};

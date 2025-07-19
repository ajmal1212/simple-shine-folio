
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateBodyProps {
  bodyText: string;
  onBodyTextChange: (text: string) => void;
}

export const TemplateBody: React.FC<TemplateBodyProps> = ({
  bodyText,
  onBodyTextChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Body Text *</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={bodyText}
          onChange={(e) => onBodyTextChange(e.target.value)}
          placeholder="Your message body text here... Use {{1}}, {{2}} for variables. Use **text** for bold formatting."
          rows={6}
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          Use {`{{1}}, {{2}}, {{3}}`} etc. for variables. Use **text** for bold formatting.
        </p>
      </CardContent>
    </Card>
  );
};

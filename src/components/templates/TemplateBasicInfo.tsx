
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateBasicInfoProps {
  name: string;
  category: string;
  language: string;
  onNameChange: (name: string) => void;
  onCategoryChange: (category: string) => void;
  onLanguageChange: (language: string) => void;
}

export const TemplateBasicInfo: React.FC<TemplateBasicInfoProps> = ({
  name,
  category,
  language,
  onNameChange,
  onCategoryChange,
  onLanguageChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Template Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="template-name" className="text-sm">Template Name *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="my_template_name"
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-sm">Category *</Label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTILITY">Utility</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="language" className="text-sm">Language</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_US">English (US)</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiCallPropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
  variables: Record<string, any>;
}

export const ApiCallProperties: React.FC<ApiCallPropertiesProps> = ({
  data,
  onUpdate,
  variables,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Block Label</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Enter block label"
        />
      </div>

      <div>
        <Label htmlFor="url">API URL</Label>
        <Input
          id="url"
          value={data.url || ''}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      <div>
        <Label htmlFor="method">HTTP Method</Label>
        <Select
          value={data.method || 'GET'}
          onValueChange={(value) => onUpdate({ method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="headers">Headers (JSON)</Label>
        <Textarea
          id="headers"
          value={typeof data.headers === 'string' ? data.headers : JSON.stringify(data.headers || {}, null, 2)}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value);
              onUpdate({ headers });
            } catch {
              onUpdate({ headers: e.target.value });
            }
          }}
          placeholder='{"Authorization": "Bearer {{api_token}}", "Content-Type": "application/json"}'
          rows={3}
        />
      </div>

      {(data.method === 'POST' || data.method === 'PUT') && (
        <div>
          <Label htmlFor="body">Request Body (JSON)</Label>
          <Textarea
            id="body"
            value={data.body || ''}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder='{"name": "{{user_name}}", "email": "{{user_email}}"}'
            rows={4}
          />
        </div>
      )}

      <div>
        <Label htmlFor="responseVariable">Save Response To Variable</Label>
        <Input
          id="responseVariable"
          value={data.responseVariable || ''}
          onChange={(e) => onUpdate({ responseVariable: e.target.value })}
          placeholder="api_response"
        />
      </div>

      <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
        <div><strong>Available variables:</strong></div>
        {Object.keys(variables).length > 0 
          ? Object.keys(variables).map(v => `{{${v}}}`).join(', ')
          : 'No variables yet'
        }
      </div>
    </div>
  );
};
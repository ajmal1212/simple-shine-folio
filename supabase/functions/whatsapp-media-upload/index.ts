
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppSettings {
  access_token: string;
  graph_api_base_url: string;
  api_version: string;
  phone_number_id: string;
  waba_id: string;
  app_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get WhatsApp settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('whatsapp_settings')
      .select('access_token, graph_api_base_url, api_version, phone_number_id, waba_id, app_id')
      .single();

    if (settingsError || !settings) {
      throw new Error('WhatsApp settings not found');
    }

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'createUploadSession': {
        const { fileName, fileLength, fileType } = payload;
        
        const formData = new FormData();
        formData.append('file_name', fileName);
        formData.append('file_length', fileLength.toString());
        formData.append('file_type', fileType);
        formData.append('access_token', settings.access_token);

        const response = await fetch(`${settings.graph_api_base_url}/${settings.api_version}/${settings.app_id}/uploads`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error.message);
        }

        return new Response(JSON.stringify({ uploadSessionId: result.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'uploadFileContent': {
        const { uploadSessionId, fileData } = payload;
        
        const sessionId = uploadSessionId.includes('upload:') ? uploadSessionId : `upload:${uploadSessionId}`;
        const uploadUrl = `${settings.graph_api_base_url}/${settings.api_version}/${sessionId}`;
        
        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `OAuth ${settings.access_token}`,
            'file_offset': '0',
            'Content-Type': 'application/octet-stream',
          },
          body: binaryData
        });

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error.message);
        }

        return new Response(JSON.stringify({ mediaHandle: result.h }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'resumeUpload': {
        const { uploadSessionId } = payload;
        
        const sessionId = uploadSessionId.includes('upload:') ? uploadSessionId : `upload:${uploadSessionId}`;
        const url = `${settings.graph_api_base_url}/${settings.api_version}/${sessionId}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `OAuth ${settings.access_token}`
          }
        });

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error.message);
        }

        return new Response(JSON.stringify({ fileOffset: parseInt(result.file_offset || '0') }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('WhatsApp media upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

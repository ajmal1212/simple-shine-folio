
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, fileName, fileLength, fileType, uploadSessionId, fileData, fileOffset } = await req.json();
    
    // Get WhatsApp credentials from environment
    const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const WHATSAPP_APP_ID = Deno.env.get('WHATSAPP_APP_ID');
    
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_APP_ID) {
      throw new Error('WhatsApp credentials not configured');
    }

    console.log(`🔧 Processing action: ${action}`);

    if (action === 'createUploadSession') {
      // Validate file size (updated to 100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (fileLength > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      // Create upload session
      const formData = new FormData();
      formData.append('file_length', fileLength.toString());
      formData.append('file_type', fileType);
      formData.append('file_name', fileName);

      const response = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_APP_ID}/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Upload session creation failed:', result);
        throw new Error(result.error?.message || 'Failed to create upload session');
      }

      console.log('✅ Upload session created:', result.id);
      return new Response(
        JSON.stringify({ uploadSessionId: result.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (action === 'uploadFileContent') {
      // Upload file content
      const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
      
      const response = await fetch(`https://graph.facebook.com/v21.0/${uploadSessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${WHATSAPP_ACCESS_TOKEN}`,
          'file_offset': (fileOffset || 0).toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: binaryData
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ File upload failed:', result);
        throw new Error(result.error?.message || 'Failed to upload file content');
      }

      console.log('✅ File uploaded successfully, handle:', result.h);
      return new Response(
        JSON.stringify({ mediaHandle: result.h }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (action === 'resumeUpload') {
      // Check upload status and get file offset
      const response = await fetch(`https://graph.facebook.com/v21.0/${uploadSessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `OAuth ${WHATSAPP_ACCESS_TOKEN}`,
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Resume upload check failed:', result);
        throw new Error(result.error?.message || 'Failed to check upload status');
      }

      console.log('✅ Upload status checked, offset:', result.file_offset || 0);
      return new Response(
        JSON.stringify({ fileOffset: result.file_offset || 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Invalid action specified');
    
  } catch (error) {
    console.error('❌ WhatsApp Media Upload Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    
    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('Webhook verification request:', { mode, token, challenge })

      if (mode === 'subscribe' && token && challenge) {
        // Verify the token against stored hub_verify_token in database
        const { data: settings, error } = await supabaseClient
          .from('whatsapp_settings')
          .select('hub_verify_token')
          .eq('hub_verify_token', token)
          .single()

        if (error || !settings) {
          console.log('Token verification failed:', error?.message || 'No matching token found')
          return new Response('Verification failed - invalid token', { status: 403, headers: corsHeaders })
        }

        console.log('Token verified successfully')
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      }

      console.log('Missing required parameters for verification')
      return new Response('Verification failed - missing parameters', { status: 403, headers: corsHeaders })
    }

    // Handle webhook data (POST request)
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('=== INCOMING WEBHOOK ===')
      console.log('Webhook timestamp:', new Date().toISOString())
      console.log('Full webhook payload:', JSON.stringify(body, null, 2))

      // Handle your custom payload structure with meta_data wrapper
      let webhookData = body;
      
      // Check if this is your custom format with meta_data wrapper
      if (body.meta_data && body.meta_data.entry) {
        console.log('Detected custom meta_data wrapper format')
        webhookData = {
          entry: body.meta_data.entry,
          object: body.meta_data.object || 'whatsapp_business_account'
        }
        console.log('Extracted webhook data:', JSON.stringify(webhookData, null, 2))
      }

      // Handle different payload structures
      const entries = webhookData.entry || []
      
      // Process webhook entries
      if (entries && entries.length > 0) {
        console.log('Processing', entries.length, 'entries')
        for (const entry of entries) {
          console.log('=== PROCESSING ENTRY ===')
          console.log('Entry ID:', entry.id)
          console.log('Entry data:', JSON.stringify(entry, null, 2))
          
          if (entry.changes) {
            console.log('Found', entry.changes.length, 'changes in entry')
            for (const change of entry.changes) {
              console.log('=== PROCESSING CHANGE ===')
              console.log('Change field:', change.field)
              console.log('Change data:', JSON.stringify(change, null, 2))
              
              if (change.field === 'messages' && change.value) {
                console.log('Processing messages change...')
                await processMessages(supabaseClient, change.value)
              } else {
                console.log('Skipping change - not a messages field or no value')
              }
            }
          } else {
            console.log('No changes found in entry')
          }
        }
      } else {
        console.log('No entries found in webhook payload')
      }

      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error) {
    console.error('=== WEBHOOK ERROR ===')
    console.error('Error:', error)
    console.error('Stack:', error.stack)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processMessages(supabaseClient: any, value: any) {
  console.log('=== PROCESSING MESSAGES ===')
  console.log('Messages value:', JSON.stringify(value, null, 2))

  // Process incoming messages
  if (value.messages && Array.isArray(value.messages)) {
    console.log('Found', value.messages.length, 'incoming messages')
    for (let i = 0; i < value.messages.length; i++) {
      const message = value.messages[i]
      console.log(`=== PROCESSING MESSAGE ${i + 1}/${value.messages.length} ===`)
      console.log('Message ID:', message.id)
      console.log('Message from:', message.from)
      console.log('Message data:', JSON.stringify(message, null, 2))
      
      try {
        await handleIncomingMessage(supabaseClient, message, value.metadata, value.contacts)
        console.log('✅ Message processed successfully:', message.id)
      } catch (error) {
        console.error('❌ Failed to process message:', message.id, error)
        console.error('Error details:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  } else {
    console.log('No messages array found or messages is not an array')
  }

  // Process message statuses (delivered, read, etc.)
  if (value.statuses && Array.isArray(value.statuses)) {
    console.log('Found', value.statuses.length, 'message statuses')
    for (let i = 0; i < value.statuses.length; i++) {
      const status = value.statuses[i]
      console.log(`=== PROCESSING STATUS ${i + 1}/${value.statuses.length} ===`)
      console.log('Status ID:', status.id)
      console.log('Status data:', JSON.stringify(status, null, 2))
      
      try {
        await handleMessageStatus(supabaseClient, status)
        console.log('✅ Status processed successfully:', status.id)
      } catch (error) {
        console.error('❌ Failed to process status:', status.id, error)
        console.error('Error details:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  } else {
    console.log('No statuses array found or statuses is not an array')
  }
}

async function handleMessageStatus(supabaseClient: any, status: any) {
  try {
    console.log('=== HANDLING MESSAGE STATUS UPDATE ===')
    console.log('Status data:', JSON.stringify(status, null, 2))
    
    // Map WhatsApp status to our status format
    let messageStatus = status.status
    if (status.status === 'read') {
      messageStatus = 'read'
    } else if (status.status === 'delivered') {
      messageStatus = 'delivered'
    } else if (status.status === 'sent') {
      messageStatus = 'sent'
    } else if (status.status === 'failed') {
      messageStatus = 'failed'
    }

    console.log('🔍 Updating message status for WhatsApp ID:', status.id, 'to status:', messageStatus)

    // First, try to find the message by exact WhatsApp ID
    const { data: existingMessage, error: findError } = await supabaseClient
      .from('messages')
      .select('id, status, whatsapp_message_id, sender_type')
      .eq('whatsapp_message_id', status.id)
      .maybeSingle()

    if (findError) {
      console.error('❌ Error finding message for status update:', findError)
      return
    }

    if (!existingMessage) {
      console.log('⚠️ No exact match found for WhatsApp ID:', status.id)
      
      // Try to find by partial match for recent user messages
      const { data: recentMessages, error: recentError } = await supabaseClient
        .from('messages')
        .select('id, status, whatsapp_message_id, sender_type, timestamp')
        .eq('sender_type', 'user')
        .order('timestamp', { ascending: false })
        .limit(20)

      if (recentError) {
        console.error('❌ Error in recent messages search:', recentError)
        return
      }

      console.log('🔍 Recent user messages for matching:', recentMessages?.map(m => ({ id: m.id, whatsapp_id: m.whatsapp_message_id })))

      // Try to find a message that might match
      const potentialMatch = recentMessages?.find(m => 
        m.whatsapp_message_id && (
          m.whatsapp_message_id.includes(status.id.substring(0, 20)) ||
          status.id.includes(m.whatsapp_message_id.substring(0, 20))
        )
      )

      if (potentialMatch) {
        console.log('✅ Found potential match via fuzzy search:', potentialMatch.id)
        // Update the message with exact WhatsApp ID and status
        const { error: updateError } = await supabaseClient
          .from('messages')
          .update({
            status: messageStatus,
            whatsapp_message_id: status.id
          })
          .eq('id', potentialMatch.id)

        if (updateError) {
          console.error('❌ Error updating message status via fuzzy match:', updateError)
        } else {
          console.log('✅ Message status updated successfully via fuzzy match:', status.id, 'to', messageStatus)
        }
        return
      }

      console.log('⚠️ No message found for status update with WhatsApp ID:', status.id)
      return
    }

    console.log('✅ Found exact match for status update:', existingMessage.id, 'current status:', existingMessage.status)

    // Only update if status is different
    if (existingMessage.status === messageStatus) {
      console.log('⚠️ Status already up to date:', messageStatus)
      return
    }

    // Update the message status
    const { error: updateError } = await supabaseClient
      .from('messages')
      .update({
        status: messageStatus
      })
      .eq('id', existingMessage.id)

    if (updateError) {
      console.error('❌ Error updating message status:', updateError)
    } else {
      console.log('✅ Message status updated successfully:', existingMessage.id, 'from', existingMessage.status, 'to', messageStatus)
    }
  } catch (error) {
    console.error('❌ Error in handleMessageStatus:', error)
    console.error('Error stack:', error.stack)
    throw error
  }
}

async function handleIncomingMessage(supabaseClient: any, message: any, metadata: any, contacts?: any[]) {
  try {
    console.log('=== HANDLING INCOMING MESSAGE ===')
    console.log('Message ID:', message.id)
    console.log('Message from:', message.from)
    console.log('Message type:', message.type)
    console.log('Metadata:', JSON.stringify(metadata, null, 2))
    console.log('Contacts:', JSON.stringify(contacts, null, 2))

    const phoneNumber = message.from
    const phoneNumberId = metadata?.phone_number_id

    if (!phoneNumber) {
      console.error('❌ No phone number found in message')
      return
    }

    if (!phoneNumberId) {
      console.error('❌ No phone_number_id found in metadata')
      return
    }

    console.log('Phone number:', phoneNumber)
    console.log('Phone number ID:', phoneNumberId)

    // Find user by phone_number_id in whatsapp_settings
    console.log('🔍 Looking up user by phone_number_id...')
    const { data: settings, error: settingsError } = await supabaseClient
      .from('whatsapp_settings')
      .select('user_id')
      .eq('phone_number_id', phoneNumberId)
      .maybeSingle()

    if (settingsError) {
      console.error('❌ Error finding user settings:', settingsError)
      return
    }

    if (!settings) {
      console.error('❌ No user found for phone_number_id:', phoneNumberId)
      return
    }

    const userId = settings.user_id
    console.log('✅ Found user ID:', userId)

    // Get contact name from contacts array or message profile
    const contactInfo = contacts?.find(c => c.wa_id === phoneNumber)
    const contactName = contactInfo?.profile?.name || message.profile?.name || null
    console.log('Contact name:', contactName)

    // Check if message already exists to prevent duplicates
    console.log('🔍 Checking if message already exists...')
    const { data: existingMessage, error: checkError } = await supabaseClient
      .from('messages')
      .select('id')
      .eq('whatsapp_message_id', message.id)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking existing message:', checkError)
      return
    }

    if (existingMessage) {
      console.log('⚠️ Message already exists, skipping:', message.id)
      return
    }

    // Create or get contact
    console.log('🔍 Creating/updating contact...')
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .upsert({
        user_id: userId,
        phone_number: phoneNumber,
        name: contactName,
        profile_picture_url: null,
        last_message_at: new Date().toISOString(),
        email: contactName ? `${contactName.toLowerCase().replace(/\s+/g, '')}@contact.com` : `${phoneNumber}@contact.com`,
        tags: ['Customer'],
        country: 'Unknown',
        source: 'WhatsApp',
        total_messages: 1
      }, {
        onConflict: 'user_id,phone_number'
      })
      .select()
      .single()

    if (contactError) {
      console.error('❌ Error creating/updating contact:', contactError)
      return
    }

    if (!contact) {
      console.error('❌ No contact returned from upsert')
      return
    }

    console.log('✅ Contact processed:', contact.id)

    // Create or get conversation
    console.log('🔍 Creating/updating conversation...')
    const { data: conversation, error: conversationError } = await supabaseClient
      .from('conversations')
      .upsert({
        user_id: userId,
        contact_id: contact.id,
        status: 'active',
        unread_count: 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,contact_id'
      })
      .select()
      .single()

    if (conversationError) {
      console.error('❌ Error creating/updating conversation:', conversationError)
      return
    }

    if (!conversation) {
      console.error('❌ No conversation returned from upsert')
      return
    }

    console.log('✅ Conversation processed:', conversation.id)

    // Create message content based on message type
    let content = {}
    let messageType = 'text'

    console.log('🔍 Processing message content...')
    if (message.type === 'text' && message.text) {
      content = { text: message.text.body }
      messageType = 'text'
      console.log('Message type: text')
    } else if (message.type === 'image' && message.image) {
      content = { 
        image: message.image,
        caption: message.image.caption || null
      }
      messageType = 'image'
      console.log('Message type: image')
    } else if (message.type === 'document' && message.document) {
      content = { 
        document: message.document,
        filename: message.document.filename || 'Document',
        caption: message.document.caption || null
      }
      messageType = 'document'
      console.log('Message type: document')
    } else if (message.type === 'audio' && message.audio) {
      content = { audio: message.audio }
      messageType = 'audio'
      console.log('Message type: audio')
    } else if (message.type === 'video' && message.video) {
      content = { 
        video: message.video,
        caption: message.video.caption || null
      }
      messageType = 'video'
      console.log('Message type: video')
    } else if (message.type === 'voice' && message.voice) {
      content = { voice: message.voice }
      messageType = 'voice'
      console.log('Message type: voice')
    } else if (message.type === 'location' && message.location) {
      content = { location: message.location }
      messageType = 'location'
      console.log('Message type: location')
    } else if (message.type === 'contacts' && message.contacts) {
      content = { contacts: message.contacts }
      messageType = 'contacts'
      console.log('Message type: contacts')
    } else {
      console.log('Message type: unknown - using text as fallback')
      content = { text: 'Unsupported message type' }
      messageType = 'text'
    }

    console.log('Message content:', JSON.stringify(content, null, 2))

    // Insert the message
    console.log('📝 Inserting new message...')
    const messageInsertData = {
      conversation_id: conversation.id,
      whatsapp_message_id: message.id,
      sender_type: 'contact',
      message_type: messageType,
      content: content,
      status: 'delivered',
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString()
    }

    console.log('Message insert data:', JSON.stringify(messageInsertData, null, 2))

    const { data: newMessage, error: messageError } = await supabaseClient
      .from('messages')
      .insert(messageInsertData)
      .select()
      .single()

    if (messageError) {
      console.error('❌ Error inserting message:', messageError)
      console.error('Insert data was:', JSON.stringify(messageInsertData, null, 2))
      return
    }

    if (!newMessage) {
      console.error('❌ No message returned from insert')
      return
    }

    console.log('✅ Message inserted successfully with ID:', newMessage.id)

    // Update conversation with last message and increment unread count
    console.log('🔍 Updating conversation...')
    const currentUnreadCount = conversation.unread_count || 0
    const { error: updateConvError } = await supabaseClient
      .from('conversations')
      .update({
        last_message_id: newMessage.id,
        unread_count: currentUnreadCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    if (updateConvError) {
      console.error('❌ Error updating conversation:', updateConvError)
    } else {
      console.log('✅ Conversation updated successfully')
    }

    // Update contact's total messages count
    console.log('🔍 Updating contact...')
    const currentTotalMessages = contact.total_messages || 0
    const { error: updateContactError } = await supabaseClient
      .from('contacts')
      .update({
        total_messages: currentTotalMessages + 1,
        last_message_at: new Date().toISOString()
      })
      .eq('id', contact.id)

    if (updateContactError) {
      console.error('❌ Error updating contact:', updateContactError)
    } else {
      console.log('✅ Contact updated successfully')
    }

    console.log('🎉 MESSAGE PROCESSING COMPLETE')
  } catch (error) {
    console.error('❌ Error in handleIncomingMessage:', error)
    console.error('Error stack:', error.stack)
    throw error
  }
}

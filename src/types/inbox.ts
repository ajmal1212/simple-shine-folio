
export interface Contact {
  id: string;
  name: string;
  phone_number: string;
  profile_picture_url?: string;
  last_message_at?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  status: string;
  unread_count: number;
  last_message?: {
    content: any;
    sender_type: string;
    timestamp: string;
  };
}

export interface Message {
  id: string;
  content: any;
  sender_type: string;
  message_type: string;
  status: string;
  timestamp: string;
}

export interface Template {
  id: string;
  name: string;
  body_text: string;
  language: string;
}

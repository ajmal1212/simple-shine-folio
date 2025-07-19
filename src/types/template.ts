
export interface ButtonComponent {
  id: string;
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'FLOW';
  text: string;
  url?: string;
  phone_number?: string;
  flow_id?: string;
  flow_cta?: string;
  flow_action?: string;
}

export interface Variable {
  name: string;
  sample: string;
}

export interface Template {
  id?: string;
  name: string;
  category: string;
  language: string;
  header_type?: string;
  header_content?: string;
  body_text: string;
  footer_text?: string;
  buttons?: ButtonComponent[];
  variables?: Variable[];
  status: string;
  created_at?: string;
  whatsapp_template_id?: string;
}

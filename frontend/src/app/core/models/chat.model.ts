export interface Chat {
  id: number;
  created_at: string;
  title: string;
  user_id: string;
}

export interface Message {
  id: number;
  created_at: string;
  role: 'user' | 'assistant';
  content: string;
  chat_id: number;
}
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth-service';
import { SupabaseService } from './supabase-service';
import { Subject } from 'rxjs';
import { Chat, Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private supabase = inject(SupabaseService);
  private authService = inject(AuthService);
  
  public activeChatId = signal<number | null>(null);
  private chatCreatedSource = new Subject<void>();
  public chatCreated$ = this.chatCreatedSource.asObservable();

  selectChat(id: number | null) {
    this.activeChatId.set(id);
  }

  notifyChatCreated() {
    this.chatCreatedSource.next();
  }

  async getChats(): Promise<Chat[]> {
    const user = this.authService.user(); // เอา user ที่ล็อกอินอยู่
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id) // ⚠️ สำคัญ: ดึงเฉพาะของ user นี้
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error.message);
    }
    return data || [];
  }

  async getMessages(chatId: number): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true }); // เรียงจากเก่าไปใหม่

    if (error) {
      console.error('Error fetching messages:', error.message);
    }
    return data || [];
  }

  async createChat(firstMessage: string): Promise<Chat | null> {
    const user = this.authService.user();
    if (!user) return null;

    const title = firstMessage.substring(0, 30) + '...';

    const { data, error } = await this.supabase
      .from('chats')
      .insert({
        user_id: user.id,
        title: title,
      })
      .select() 
      .single();

    if (error) {
      console.error('Error creating chat:', error.message);
    }
    return data as Chat | null;
  }

  async addMessage(chatId: number, role: 'user' | 'assistant', content: string) {
    const { error } = await this.supabase
      .from('messages')
      .insert({
        chat_id: chatId, 
        role: role,
        content: content,
      });

    if (error) {
      console.error('Error saving message:', error.message);
    }
  }
}

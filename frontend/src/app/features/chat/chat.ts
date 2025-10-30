import { AfterViewChecked, Component, ElementRef, OnChanges, OnInit, ViewChild, effect, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat-service';
import { Navbar } from '../../layouts/navbar/navbar';
import { VectorSearchInterface, VectorSearchResponse } from '../../core/models/vector-search-interface';
import { ChatHistoryService } from '../../core/services/chat-history-service';
import { AuthService } from '../../core/services/auth-service';
import { Message } from '../../core/models/chat.model';
import { UiStateService } from '../../core/services/ui-state-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  imports: [ReactiveFormsModule, Navbar]
})
export class Chat implements OnInit, AfterViewChecked {

  // --- Services ---
  uiState = inject(UiStateService);
  private chatHistoryService = inject(ChatHistoryService);
  authService = inject(AuthService);
  private chatService = inject(ChatService); // (Service RAG เดิม)
  private fb = inject(FormBuilder);

  // --- State ---
  // (นี่คือ Array ที่ใช้แสดงผลใน UI)
  chatHistory: { question: string; answer?: string; loading?: boolean }[] = [];
  loading = false;
  results: VectorSearchResponse[] = []; // (จากโค้ดเดิม)

  // --- Form & View ---
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;
  chatForm = this.fb.group({
    question: ['', Validators.required],
  });

  constructor() {
    // 3. 👈 (สำคัญมาก) "ดักฟัง" การเปลี่ยนแปลง ID จาก Service
    // "effect" จะรัน 1 ครั้งตอนเริ่ม และรันซ้ำทุกครั้งที่ signal "activeChatId" เปลี่ยน
    effect(() => {
      const newId = this.chatHistoryService.activeChatId();
      console.log('ChatComponent: ID เปลี่ยนเป็น', newId);
      this.loadChat(newId); // <--- เมื่อ ID เปลี่ยน ให้โหลดแชทใหม่
    });
  }

  ngOnInit(): void {
    // (เราใช้ effect ใน constructor แล้ว ตรงนี้เลยอาจจะไม่ต้องทำอะไร)
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // --- (A) Core Functions (โหลดและส่ง) ---

  /**
   * (A.1) โหลดข้อความเก่า (เมื่อ ID เปลี่ยน)
   */
  async loadChat(id: number | null) {
    this.chatHistory = []; // เคลียร์หน้าจอ
    this.chatForm.reset();

    if (id !== null) {
      // 1. ถ้ามี ID (โหลดแชทเก่า)
      this.loading = true;
      const messages = await this.chatHistoryService.getMessages(id);

      // 2. (สำคัญ) แปลง Format (DB) เป็น Format (UI)
      this.chatHistory = this.formatMessagesForUI(messages);
      this.loading = false;
      this.scrollToBottom();
    }
    // 3. ถ้า id เป็น null (แชทใหม่) ก็ไม่ต้องทำอะไร (หน้าจอเคลียร์แล้ว)
  }

  /**
   * (A.2) ส่งข้อความ (RAG + History)
   */
  async LLMAnswer() {
    if (this.loading) return;
    const question = this.chatForm.get('question')?.value || '';
    if (!question.trim()) return;

    // 1. (UI) เพิ่มคำถามในหน้าจอทันที
    const msgIndex = this.chatHistory.push({ question, loading: true }) - 1;
    this.loading = true;
    this.chatForm.disable();
    this.scrollToBottom();

    try {
      const user = this.authService.user();
      let currentId = this.chatHistoryService.activeChatId(); // 2. (DB) อ่าน ID ปัจจุบัน

      if (user) {
        // --- ส่วนจัดการ History ---
        if (currentId === null) {
          // 3. (DB) ถ้าเป็นแชทใหม่ (ID=null)
          const newChat = await this.chatHistoryService.createChat(question);
          if (newChat) {
            currentId = newChat.id;
            // 4. (สำคัญ!) "ตะโกน" บอก Service
            this.chatHistoryService.notifyChatCreated(); // (บอก Sidebar ให้โหลดใหม่)
            this.chatHistoryService.selectChat(currentId);  // (บอกตัวเองว่าแชทนี้คือ Active)
          } else {
            throw new Error('Could not create chat');
          }
        }
        // 5. (DB) บันทึกคำถาม User
        await this.chatHistoryService.addMessage(currentId!, 'user', question);
      }

      // --- ส่วน RAG (โค้ดเดิมของคุณ) ---
      const topResults = await this.queryVectorDB();
      const context = topResults.map(r => r.payload.content).join('\n');

      this.chatService.askLLM(context, question).subscribe({
        next: async (res) => {
          // 6. (UI) อัปเดตคำตอบ AI
          this.chatHistory[msgIndex].answer = res.answer;
          this.chatHistory[msgIndex].loading = false;

          // 7. (DB) บันทึกคำตอบ Assistant
          if (user) {
            await this.chatHistoryService.addMessage(currentId!, 'assistant', res.answer);
          }
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('LLM error:', err);
          this.chatHistory[msgIndex].answer = 'เกิดข้อผิดพลาดในการเรียก LLM';
          this.chatHistory[msgIndex].loading = false;
          this.scrollToBottom();
        },
        complete: () => {
          this.loading = false;
          this.chatForm.enable();
          this.chatForm.reset(); // (ย้าย reset มาไว้ตรงนี้ดีกว่า)
        }
      });

    } catch (err) {
      console.error('LLMAnswer error:', err);
      this.chatHistory[msgIndex].answer = 'เกิดข้อผิดพลาด (ดู Console)';
      this.chatHistory[msgIndex].loading = false;
      this.loading = false;
      this.chatForm.enable();
      this.scrollToBottom();
    }
  }
  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }
  onSubmit() {
    this.LLMAnswer();
  }

  private formatMessagesForUI(messages: Message[]): { question: string; answer?: string }[] {
    const uiHistory: { question: string; answer?: string }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        uiHistory.push({
          question: messages[i].content,
          answer: (messages[i + 1] && messages[i + 1].role === 'assistant') ? messages[i + 1].content : undefined
        });
        if (messages[i + 1] && messages[i + 1].role === 'assistant') {
          i++;
        }
      }
    }
    return uiHistory;
  }

  queryVectorDB(): Promise<VectorSearchResponse[]> {
    const data: VectorSearchInterface = {
      query: this.chatForm.get('question')?.value || '',
      top_k: 3,
    };
    return new Promise((resolve, reject) => {
      this.chatService.queryVectorDB(data).subscribe({
        next: results => { this.results = results; resolve(results); },
        error: err => reject(err)
      });
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainerRef) {
        const container = this.chatContainerRef.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) { }
  }
}
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth-service';
import { ChatHistoryService } from '../../core/services/chat-history-service';
import { UiStateService } from '../../core/services/ui-state-service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  chatHistoryService = inject(ChatHistoryService);
  authService = inject(AuthService);
  private router = inject(Router);
  uiState = inject(UiStateService);

  toggle() {
    this.uiState.toggleSidebar();
  }

  chats = signal<any[]>([]);
  private refreshSubscription: Subscription;

  // 2. เพิ่ม property 'isMobile'
  private isMobile: boolean;

  constructor() {
    this.refreshSubscription = this.chatHistoryService.chatCreated$.subscribe(() => {
      this.loadAllChats();
    });

    // 3. เพิ่มการเช็กขนาดจอครั้งแรก (768px = breakpoint 'md' ของ Tailwind)
    this.isMobile = window.innerWidth < 768;
  }

  // 4. เพิ่ม 'HostListener' เพื่อคอยเช็กว่าจอมือถือถูกหมุนหรือไม่
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.loadAllChats();
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  async loadAllChats() {
    const data = await this.chatHistoryService.getChats(); // (ใช้ getChats ตามโค้ดเดิม)
    this.chats.set(data);
  }

  onNewChat() {
    this.chatHistoryService.selectChat(null);

    // 5. (ส่วนที่เพิ่ม) ถ้าเป็นมือถือ & sidebar เปิดอยู่ ให้สั่งปิด
    if (this.isMobile && this.uiState.isSidebarOpen()) {
      this.uiState.toggleSidebar();
    }
  }

  onSelect(id: number) {
    this.chatHistoryService.selectChat(id);

    // 5. (ส่วนที่เพิ่ม) ถ้าเป็นมือถือ & sidebar เปิดอยู่ ให้สั่งปิด
    if (this.isMobile && this.uiState.isSidebarOpen()) {
      this.uiState.toggleSidebar();
    }
  }
}
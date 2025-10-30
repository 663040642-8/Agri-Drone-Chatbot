import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  
  public isSidebarOpen = signal(this.isDesktop);

  public toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
}

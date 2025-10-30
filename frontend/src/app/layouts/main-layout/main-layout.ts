import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Navbar } from "../navbar/navbar";
import { Sidebar } from "../sidebar/sidebar";
import { AuthService } from '../../core/services/auth-service';
import { UiStateService } from '../../core/services/ui-state-service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  uiState = inject(UiStateService);
  authService = inject(AuthService);
  isSidebarOpen = signal(true);
}

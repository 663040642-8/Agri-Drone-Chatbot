import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth-service';
import { Navbar } from "./layouts/navbar/navbar";
import { Sidebar } from "./layouts/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  protected readonly title = signal('frontend');
}

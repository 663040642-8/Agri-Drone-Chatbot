import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  authService = inject(AuthService);
  isMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth >= 768) {
      this.isMenuOpen = false;
    }
  }
}

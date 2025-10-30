import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service'; 
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  loading = signal<boolean>(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async login() {
    if (this.loginForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ถูกต้อง');
      return;
    }
    const { email, password } = this.loginForm.value;
    this.loading.set(true);
    try {
      const { data, error } = await this.authService.signIn(email!, password!);

      if (error) throw error;

      this.router.navigate(['/chat']);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสมัครสมาชิก: ' + (error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}

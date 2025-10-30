import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  loading = signal<boolean>(false);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async register() {
    if (this.registerForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ถูกต้อง');
      return;
    }
    const { email, password } = this.registerForm.value;
    this.loading.set(true);
    try {
      const { data, error } = await this.authService.signUp(email!, password!);

      if (error) throw error;

      this.router.navigate(['/verify']);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสมัครสมาชิก: ' + (error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}

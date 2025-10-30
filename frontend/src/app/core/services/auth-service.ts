import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  #user = signal<User | null>(null);
  loading = signal<boolean>(true);

  constructor() {
    this.initUser();
  }

  private async initUser() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.#user.set(session?.user ?? null);
    this.loading.set(false);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.#user.set(session?.user ?? null);
    });
  }

  get user() {
    return this.#user;
  }

  get isLoggedIn() {
    return !!this.#user();
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.#user.set(null);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (!error) this.#user.set(data.user);
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    return { data, error };
  }
}

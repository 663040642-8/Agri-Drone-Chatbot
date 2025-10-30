import { Injectable } from '@angular/core';
import { supabase } from '../lib/supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  get auth() {
    return supabase.auth;
  }

  from(table: string) {
    return supabase.from(table);
  }

  get client() {
    return supabase;
  }
}

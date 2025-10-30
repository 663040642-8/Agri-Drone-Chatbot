import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { VectorSearchInterface, VectorSearchResponse } from '../models/vector-search-interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private llmAPI = 'http://localhost:3000/ai/ask';
  private vectorAPI = 'http://localhost:8000';
  private http = inject(HttpClient);

  queryVectorDB(data: VectorSearchInterface) {
    return this.http.post<VectorSearchResponse[]>(`${this.vectorAPI}/query`, data);
  }

  askLLM(context: string, question: string) {
    return this.http.post<{ answer: string }>(this.llmAPI, { context, question });
  }
}

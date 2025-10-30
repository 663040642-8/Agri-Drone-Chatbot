export interface VectorSearchInterface {
  query: string;
  top_k: number;
}

export interface VectorSearchResponse {
  id: string;
  score: number;
  payload: {
    category: string;
    source: string;
    chunk_index: number;
    content: string;
  };
}

import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from typing import List
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

QDRANT_CLOUD_URL = os.getenv('QDRANT_CLOUD_URL')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
QDRANT_COLLECTION = os.getenv('QDRANT_COLLECTION')

model = SentenceTransformer("intfloat/multilingual-e5-small")
client = QdrantClient(
    url=QDRANT_CLOUD_URL,
    api_key=QDRANT_API_KEY
)

app = FastAPI(title="Vector Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

class SearchResult(BaseModel):
    id: str
    score: float
    payload: dict

def embed_text(text: str):
    return model.encode(f"query: {text}", normalize_embeddings=True).tolist()

@app.post("/query", response_model=List[SearchResult])
def search(req: SearchRequest):
    try:
        query_embedding = embed_text(req.query)
        hits = client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=query_embedding,
            limit=req.top_k
        )
        return [
            SearchResult(id=str(hit.id), score=hit.score, payload=hit.payload)
            for hit in hits
        ]
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
def health():
    return {"status": "ok"}
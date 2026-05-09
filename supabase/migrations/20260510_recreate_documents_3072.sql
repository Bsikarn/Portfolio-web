-- ============================================================
-- Migration: Recreate documents table for gemini-embedding-001
-- Vector dimension: 768 (outputDimensionality reduced from 3072)
-- Compatible with HNSW index (max 2000 dims)
-- Run this in Supabase SQL Editor before re-seeding
-- ============================================================

-- 1. Drop old function and table if they exist
DROP FUNCTION IF EXISTS match_documents(vector, float, int);
DROP TABLE IF EXISTS documents;

-- 2. Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 3. Create documents table with 768-dim vector
CREATE TABLE documents (
  id        bigserial PRIMARY KEY,
  content   text,
  metadata  jsonb,
  embedding vector(768)
);

-- 4. Create HNSW index for fast cosine similarity search (supports up to 2000 dims)
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- 5. Create the RPC function used by the Edge Function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count     int   DEFAULT 5
)
RETURNS TABLE (
  id         bigint,
  content    text,
  metadata   jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

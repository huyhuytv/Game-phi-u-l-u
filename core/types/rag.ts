// =================================================================
// RAG - RETRIEVAL-AUGMENTED GENERATION
// =================================================================

export type VectorEntityType = 'item' | 'skill' | 'quest' | 'npc' | 'location' | 'lore' | 'faction' | 'wife' | 'slave' | 'prisoner' | 'beast';

export interface VectorMetadata {
  entityId: string;       // ID of the original object (e.g., npc-123)
  entityType: VectorEntityType; // The type of the object
  text: string;           // The original text that was vectorized
}

export interface VectorStore {
  vectors: number[][];      // Array of vectors (each vector is an array of 768 numbers)
  metadata: VectorMetadata[]; // Array of corresponding metadata, 1-to-1 with vectors
}

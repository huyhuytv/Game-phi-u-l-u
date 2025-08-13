import { VectorStore } from "../types";

/**
 * Calculates the dot product of two vectors.
 * @param vecA The first vector.
 * @param vecB The second vector.
 * @returns The dot product.
 */
function dotProduct(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length to calculate dot product.");
    }
    return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

/**
 * Calculates the magnitude (or Euclidean norm) of a vector.
 * @param vec The vector.
 * @returns The magnitude of the vector.
 */
function magnitude(vec: number[]): number {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Calculates the cosine similarity between two vectors.
 * The result ranges from -1 (exactly opposite) to 1 (exactly the same).
 * @param vecA The first vector.
 * @param vecB The second vector.
 * @returns The cosine similarity score.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dot = dotProduct(vecA, vecB);
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);
    
    // Handle potential division by zero
    if (magA === 0 || magB === 0) {
        return 0;
    }
    
    return dot / (magA * magB);
}

/**
 * Searches the vector store for the top K most similar entries to a query vector.
 * @param queryVector The vector representation of the player's action.
 * @param vectorStore The game's long-term memory store.
 * @param topK The number of most similar results to return.
 * @returns An array of the original text from the most relevant metadata entries.
 */
export function searchVectors(queryVector: number[], vectorStore: VectorStore, topK: number): string[] {
    if (!vectorStore || vectorStore.vectors.length === 0 || topK <= 0) {
        return [];
    }

    const scores = vectorStore.vectors.map((vec, index) => ({
        score: cosineSimilarity(queryVector, vec),
        text: vectorStore.metadata[index].text
    }));

    // Sort by score in descending order
    scores.sort((a, b) => b.score - a.score);

    // Return the text of the top K results
    return scores.slice(0, topK).map(result => result.text);
}

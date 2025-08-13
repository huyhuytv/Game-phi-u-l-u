

import { GoogleGenAI } from "@google/genai";

const getEmbeddingClient = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
        throw new Error("API Key for embedding is not configured!");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Converts an array of text strings into an array of vectors using Google's embedding model.
 * The model 'text-embedding-004' is used for this purpose.
 * @param texts An array of strings to vectorize.
 * @returns A Promise that resolves to an array of vectors (each vector is an array of numbers).
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) {
        return [];
    }
    
    const modelName = 'text-embedding-004';
    const ai = getEmbeddingClient();

    try {
        // Use batch embedding for efficiency by sending all texts in a single API call.
        const result = await ai.models.embedContent({
            model: modelName,
            contents: texts.map(text => ({ parts: [{ text }] })),
        });
        
        return result.embeddings.map(emb => emb.values);

    } catch (error) {
        console.error(`Error creating embeddings with model ${modelName}:`, error);
        throw error; // Propagate the error for the calling logic to handle
    }
}
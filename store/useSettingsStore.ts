

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// The model key should reflect the actual model name used in the API.
export type AiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export const AI_MODEL_DISPLAY_NAMES: Record<AiModel, string> = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash (Nhanh & Nhẹ)',
    'gemini-2.5-pro': 'Gemini 2.5 Pro (Mạnh Mẽ & Sáng Tạo)',
};


interface SettingsState {
    model: AiModel;
    setModel: (model: AiModel) => void;
    ragTopK: number;
    setRagTopK: (k: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            model: 'gemini-2.5-flash',
            setModel: (model) => set({ model }),
            ragTopK: 10, // Default to retrieving top 10 relevant contexts
            setRagTopK: (k) => set({ ragTopK: Math.max(0, k) }), // Ensure k is non-negative
        }),
        {
            name: 'tien-lo-ky-settings-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
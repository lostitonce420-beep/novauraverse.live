import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'kimi' | 'ollama' | 'lmstudio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIState {
  provider: AIProvider;
  geminiKey: string;
  claudeKey: string;
  openaiKey: string;
  kimiKey: string;
  localEndpoint: string;
  messages: ChatMessage[];
  isThinking: boolean;
  isPersistentPersona: boolean;
  activeIDETab: 'editor' | 'preview';
  ideMainLayout: Record<string, number> | null;
  ideCenterLayout: Record<string, number> | null;

  // Actions
  setProvider: (provider: AIProvider) => void;
  setGeminiKey: (key: string) => void;
  setClaudeKey: (key: string) => void;
  setOpenaiKey: (key: string) => void;
  setKimiKey: (key: string) => void;
  setLocalEndpoint: (endpoint: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  setThinking: (thinking: boolean) => void;
  setPersistentPersona: (enabled: boolean) => void;
  setActiveIDETab: (tab: 'editor' | 'preview') => void;
  setIDELayout: (key: 'ideMainLayout' | 'ideCenterLayout', layout: Record<string, number>) => void;
  setAIState: (state: Partial<AIState>) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      provider: 'gemini',
      geminiKey: '',
      claudeKey: '',
      openaiKey: '',
      kimiKey: '',
      localEndpoint: 'http://localhost:11434/api/generate', // Default Ollama
      messages: [],
      isThinking: false,
      isPersistentPersona: true,
      activeIDETab: 'preview',
      ideMainLayout: null,
      ideCenterLayout: null,

      setProvider: (provider) => set({ provider }),
      setGeminiKey: (geminiKey) => set({ geminiKey }),
      setClaudeKey: (claudeKey) => set({ claudeKey }),
      setOpenaiKey: (openaiKey) => set({ openaiKey }),
      setKimiKey: (kimiKey) => set({ kimiKey }),
      setLocalEndpoint: (localEndpoint) => set({ localEndpoint }),
      
      addMessage: (msg) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...msg,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          }
        ]
      })),

      clearHistory: () => set({ messages: [] }),
      setThinking: (isThinking) => set({ isThinking }),
      setPersistentPersona: (isPersistentPersona) => set({ isPersistentPersona }),
      setActiveIDETab: (activeIDETab) => set({ activeIDETab }),
      setIDELayout: (key, layout) => set({ [key]: layout }),
      setAIState: (newState) => set((state) => ({ ...state, ...newState })),
    }),
    {
      name: 'novaura-ai-settings',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const userJson = localStorage.getItem('novaura_current_user');
          const userId = userJson ? JSON.parse(userJson).id : 'guest';
          return localStorage.getItem(`${name}_${userId}`);
        },
        setItem: (name, value) => {
          const userJson = localStorage.getItem('novaura_current_user');
          const userId = userJson ? JSON.parse(userJson).id : 'guest';
          localStorage.setItem(`${name}_${userId}`, value);
        },
        removeItem: (name) => {
          const userJson = localStorage.getItem('novaura_current_user');
          const userId = userJson ? JSON.parse(userJson).id : 'guest';
          localStorage.removeItem(`${name}_${userId}`);
        },
      })),
    }
  )
);

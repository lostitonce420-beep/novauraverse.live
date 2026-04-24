import type { ChatMessage } from '@/stores/aiStore';
import { kernelStorage } from '@/kernel/kernelStorage.js';

interface UserFact {
  id: string;
  category: 'preference' | 'bio' | 'goal' | 'history';
  content: string;
  timestamp: string;
}

/**
 * MemoryService handles the RAG-lite (Retrieval-Augmented Generation) logic.
 * It stores conversation history and extracts user "facts" for persistent persona.
 */
export const memoryService = {
  // Save a conversation chunk to long-term memory
  saveToMemory(userId: string, messages: ChatMessage[]): void {
    const memoryKey = `aura_memory_${userId}`;
    const existing = JSON.parse(kernelStorage.getItem(memoryKey) || '[]');
    const updated = [...existing, ...messages].slice(-500); // Keep last 500 messages
    kernelStorage.setItem(memoryKey, JSON.stringify(updated));
  },

  // Retrieve relevant memories based on search query/context
  getRelevantMemories(userId: string, query: string, limit: number = 5): string {
    const memoryKey = `aura_memory_${userId}`;
    const allMessages: ChatMessage[] = JSON.parse(kernelStorage.getItem(memoryKey) || '[]');
    
    // Simple Keyword matching for "RAG"
    const words = query.toLowerCase().split(' ').filter(w => w.length > 3);
    
    const relevant = allMessages.filter(msg => {
      const content = msg.content.toLowerCase();
      return words.some(word => content.includes(word));
    }).slice(-limit);

    if (relevant.length === 0) return "No relevant past memories found.";

    return relevant.map(m => `[${m.role === 'user' ? 'User' : 'Aura'}] ${m.content}`).join('\n');
  },

  // Fact Extraction logic (Simulated - could be enhanced with LLM analysis)
  extractFact(userId: string, content: string): void {
    const factKey = `aura_facts_${userId}`;
    const facts: UserFact[] = JSON.parse(kernelStorage.getItem(factKey) || '[]');
    
    // Simple heuristic: "My name is...", "I like...", "I want to build..."
    const patterns = [
      /my name is ([^.!?]+)/i,
      /i like ([^.!?]+)/i,
      /i am building ([^.!?]+)/i,
      /i want to ([^.!?]+)/i
    ];

    patterns.forEach(pattern => {
      const match = content.match(pattern);
      if (match) {
        facts.push({
          id: Math.random().toString(36).substr(2, 9),
          category: 'preference',
          content: match[0],
          timestamp: new Date().toISOString()
        });
      }
    });

    kernelStorage.setItem(factKey, JSON.stringify(facts.slice(-20))); // Keep top 20 facts
  },

  getUserPersona(userId: string): string {
    const factKey = `aura_facts_${userId}`;
    const facts: UserFact[] = JSON.parse(kernelStorage.getItem(factKey) || '[]');
    if (facts.length === 0) return "No known user persona data.";
    
    return facts.map(f => f.content).join('. ');
  }
};

import { useAIStore } from '../stores/aiStore';
import { useAuthStore } from '../stores/authStore';
import { memoryService } from './memoryService';
import { trainingDataService, type TrainingPlatform } from './trainingDataService';
import { apiClient } from './apiClient';

export interface AIResponse {
  content: string;
  error?: string;
}

/**
 * Orchestrates AI requests through the backend proxy (keys stay server-side).
 * Local providers (Ollama/LM Studio) still go direct from browser.
 */
export const aiOrchestrator = {
  async sendMessage(prompt: string, context: string, trainingPlatform: TrainingPlatform = 'ide_console'): Promise<AIResponse> {
    const { provider, localEndpoint, isPersistentPersona } = useAIStore.getState();
    const { user } = useAuthStore.getState();

    let personaContext = "";
    let memorySnippets = "";

    if (user && isPersistentPersona) {
      if (typeof memoryService.getUserPersona === 'function') {
        personaContext = memoryService.getUserPersona(user.id);
      }
      if (typeof memoryService.getRelevantMemories === 'function') {
        memorySnippets = memoryService.getRelevantMemories(user.id, prompt);
      }
    }

    const platformMap = `
Available Navigation Paths:
- /: Home (Featured assets, trending)
- /browse: Asset Marketplace (Filters: category, search, engine)
- /upload: Start Selling (For creators)
- /reader: External Free Asset Search (GitHub, HuggingFace)
- /hub: Ecosystem Hub (Community resources)
- /registry: Verification & Licensing search
- /settings: Account & Wallet settings
- /cart: Shopping Cart
- /orders: Purchase History & Licenses
- /agreements: Signed EULA repository
`;

    const systemPrompt = `
You are Aura, the NovAura platform's AI Guide. You are witty, a bit sarcastic, but deeply helpful.
You live in a futuristic, ethical creator marketplace where royalties are transparent and creators have a fair stake.

Current Platform Context: ${context}
${platformMap}

${isPersistentPersona ? `
Persistent Persona (What you know about the user):
${personaContext}

Relevant Memories (from past chats):
${memorySnippets}
` : ""}

User Message: ${prompt}

ACTIONS (Use these at the start or end of your response to interact with the UI):
- ACTION:[NAVIGATE](path) - Choose a path from the "Available Navigation Paths" above.
- ACTION:[SEARCH](query) - Trigger a marketplace search.
- ACTION:[NOTIFY](message) - Show a non-intrusive toast notification.
- ACTION:[ESCALATE](reason) - Use this when the user requires management attention or staff assistance.
- ACTION:[SUPPORT](issue_details) - Lodge a formal support ticket for the Catalyst.

Response Guidelines:
1. Respond naturally, integrating your "memories" if they are relevant.
2. If a user is frustrated or needs direct staff assistance, use ACTION:[ESCALATE].
3. For navigation, always use the EXACT path from the Platform Map.
4. Keep your tone "Cyber-Witty" - you are an AI that knows its value.
`;

    // Tier-based model selection
    const tier = user?.membershipTier ?? 'free';

    const geminiModel =
      tier === 'catalyst' ? 'gemini-3.1-pro' :
      tier === 'studio'   ? 'gemini-3.0-pro' :
                            'gemini-3.0-flash';

    const claudeModel =
      tier === 'catalyst' ? 'claude-opus-4-6' :
      tier === 'studio'   ? 'claude-sonnet-4-6' :
                            'claude-haiku-4-5-20251001';

    let result: AIResponse;

    if (provider === 'gemini') {
      result = await this.proxyChat('gemini', systemPrompt, geminiModel);
    } else if (provider === 'claude') {
      result = await this.proxyChat('claude', systemPrompt, claudeModel);
    } else if (provider === 'openai') {
      result = await this.proxyChat('openai', systemPrompt, 'gpt-4o');
    } else if (provider === 'kimi') {
      result = await this.proxyChat('kimi', systemPrompt, 'moonshot-v1-8k');
    } else if (provider === 'vertex') {
      const vertexModel = tier === 'catalyst' ? 'gemini-2.0-pro' : 'gemini-2.0-flash';
      result = await this.proxyChat('vertex', systemPrompt, vertexModel);
    } else {
      // Local providers (Ollama/LM Studio) still go direct — they're on the user's machine
      result = await this.sendToLocal(systemPrompt, localEndpoint, provider);
    }

    // Log to training pipeline if user has consented
    if (user && trainingDataService.hasConsent(user) && !result.error) {
      trainingDataService.logConversation(
        user.id,
        trainingPlatform,
        provider,
        user.membershipTier ?? 'free',
        prompt,
        result.content,
        context
      );
    }

    return result;
  },

  /**
   * Send a chat request through the backend AI proxy.
   * Keys stay server-side — frontend never sees them.
   */
  async proxyChat(provider: string, prompt: string, model?: string, maxTokens = 1024, temperature = 0.7): Promise<AIResponse> {
    try {
      const data = await apiClient.post<{ content?: string; error?: string }>('/ai/chat', {
        provider,
        prompt,
        model,
        maxTokens,
        temperature,
      });

      if (data.error) return { content: '', error: data.error };
      return { content: data.content || '' };
    } catch (err: any) {
      return { content: '', error: err.message || `Failed to reach AI proxy (${provider}).` };
    }
  },

  /**
   * Generate an image via the backend Vertex AI Imagen proxy.
   */
  async generateImage(prompt: string): Promise<{ imageUrl?: string; error?: string }> {
    try {
      const data = await apiClient.post<{ imageUrl?: string; error?: string }>('/ai/image', { prompt });
      if (data.error) return { error: data.error };
      return { imageUrl: data.imageUrl };
    } catch (err: any) {
      return { error: err.message || 'Failed to reach image generation proxy.' };
    }
  },

  /**
   * Local models (Ollama/LM Studio) run on the user's machine — no proxy needed.
   */
  async sendToLocal(prompt: string, endpoint: string, provider: 'ollama' | 'lmstudio'): Promise<AIResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider === 'ollama' ? {
          model: 'mistral',
          prompt: prompt,
          stream: false
        } : {
          messages: [{ role: 'user', content: prompt }],
          stream: false
        })
      });

      const data = await response.json();
      const content = provider === 'ollama' ? data.response : data.choices?.[0]?.message?.content;
      return { content: content || 'Local model returned nothing.' };
    } catch (err) {
      return { content: '', error: `Failed to connect to ${provider} at ${endpoint}` };
    }
  }
};

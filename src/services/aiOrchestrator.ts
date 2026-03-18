import { useAIStore } from '../stores/aiStore';
import { useAuthStore } from '../stores/authStore';
import { memoryService } from './memoryService';
import { trainingDataService, type TrainingPlatform } from './trainingDataService';

export interface AIResponse {
  content: string;
  error?: string;
}

/**
 * Orchestrates AI requests between Cloud (Gemini) and Local (Ollama/LM Studio).
 */
export const aiOrchestrator = {
  async sendMessage(prompt: string, context: string, trainingPlatform: TrainingPlatform = 'ide_console'): Promise<AIResponse> {
    const { provider, geminiKey, claudeKey, openaiKey, kimiKey, vertexKey, vertexProjectId, localEndpoint, isPersistentPersona } = useAIStore.getState();
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

    // @ts-ignore
    const apiKey = geminiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);

    // Tier-based model selection
    const tier = user?.membershipTier ?? 'free';

    const geminiModel =
      tier === 'catalyst' ? 'gemini-3.1-pro' :
      tier === 'studio'   ? 'gemini-3.0-pro' :
                            'gemini-3.0-flash'; // free + creator

    const claudeModel =
      tier === 'catalyst' ? 'claude-opus-4-6' :
      tier === 'studio'   ? 'claude-sonnet-4-6' :
                            'claude-haiku-4-5-20251001'; // creator + fallback

    let result: AIResponse;

    if (provider === 'gemini') {
      result = await this.sendToGemini(systemPrompt, apiKey, geminiModel);
    } else if (provider === 'claude') {
      // @ts-ignore
      result = await this.sendToClaude(systemPrompt, claudeKey || (import.meta.env.VITE_CLAUDE_API_KEY as string), claudeModel);
    } else if (provider === 'openai') {
      // @ts-ignore
      result = await this.sendToOpenAI(systemPrompt, openaiKey || (import.meta.env.VITE_OPENAI_API_KEY as string));
    } else if (provider === 'kimi') {
      // @ts-ignore
      result = await this.sendToKimi(systemPrompt, kimiKey || (import.meta.env.VITE_KIMI_API_KEY as string));
    } else if (provider === 'vertex') {
      // @ts-ignore
      const key = vertexKey || (import.meta.env.VITE_VERTEX_AI_KEY as string);
      // @ts-ignore
      const projectId = vertexProjectId || (import.meta.env.VITE_VERTEX_PROJECT_ID as string);
      const vertexModel = tier === 'catalyst' ? 'gemini-2.0-pro' : tier === 'studio' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
      result = await this.sendToVertex(systemPrompt, key, projectId, vertexModel);
    } else {
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

  async sendToClaude(prompt: string, apiKey: string, model = 'claude-haiku-4-5-20251001'): Promise<AIResponse> {
    if (!apiKey) return { content: '', error: 'Claude API Key missing.' };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { content: '', error: `Claude API Error: ${response.status} ${errorData.error?.message || ''}` };
      }

      const data = await response.json();
      return { content: data.content?.[0]?.text || 'No response from Claude.' };
    } catch {
      return { content: '', error: 'Failed to connect to Claude API.' };
    }
  },

  async sendToOpenAI(prompt: string, apiKey: string): Promise<AIResponse> {
    if (!apiKey) return { content: '', error: 'OpenAI API Key missing.' };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { content: '', error: `OpenAI API Error: ${response.status} ${errorData.error?.message || ''}` };
      }

      const data = await response.json();
      return { content: data.choices?.[0]?.message?.content || 'No response from OpenAI.' };
    } catch {
      return { content: '', error: 'Failed to connect to OpenAI API.' };
    }
  },

  async sendToKimi(prompt: string, apiKey: string): Promise<AIResponse> {
    if (!apiKey) return { content: '', error: 'Kimi API Key missing.' };

    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        return { content: '', error: `Kimi API Error: ${response.status}` };
      }

      const data = await response.json();
      return { content: data.choices[0].message.content };
    } catch (err) {
      return { content: '', error: 'Failed to connect to Kimi API.' };
    }
  },

  async sendToGemini(prompt: string, apiKey: string, model = 'gemini-3.0-flash'): Promise<AIResponse> {
    if (!apiKey) return { content: '', error: 'Gemini API Key missing.' };

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { content: '', error: `Gemini API Error: ${response.status} ${errorData.error?.message || ''}` };
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I failed to generate a response.';
      return { content };
    } catch (err) {
      return { content: '', error: 'Failed to connect to Gemini API.' };
    }
  },

  async sendToVertex(prompt: string, apiKey: string, projectId: string, model = 'gemini-2.0-flash'): Promise<AIResponse> {
    if (!apiKey) return { content: '', error: 'Vertex AI key missing.' };

    try {
      // If we have a project ID, use the Vertex AI endpoint; otherwise fall back to Gemini API
      const url = projectId
        ? `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (projectId) headers['Authorization'] = `Bearer ${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return { content: '', error: `Vertex AI Error: ${response.status} ${err.error?.message || ''}` };
      }

      const data = await response.json();
      return { content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Vertex AI.' };
    } catch {
      return { content: '', error: 'Failed to connect to Vertex AI.' };
    }
  },

  /**
   * Generate an image via Vertex AI Imagen 3.
   * Returns a base64 data URL or an error string.
   */
  async generateImage(prompt: string, apiKey?: string, projectId?: string): Promise<{ imageUrl?: string; error?: string }> {
    // @ts-ignore
    const key = apiKey || (import.meta.env.VITE_VERTEX_AI_KEY as string);
    // @ts-ignore
    const pid = projectId || (import.meta.env.VITE_VERTEX_PROJECT_ID as string);

    if (!key || !pid) return { error: 'Vertex AI key and project ID required for image generation.' };

    try {
      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${pid}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: '1:1' },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return { error: `Imagen Error: ${response.status} ${err.error?.message || ''}` };
      }

      const data = await response.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) return { error: 'No image returned from Imagen.' };
      return { imageUrl: `data:image/png;base64,${b64}` };
    } catch {
      return { error: 'Failed to connect to Vertex AI Imagen.' };
    }
  },

  async sendToLocal(prompt: string, endpoint: string, provider: 'ollama' | 'lmstudio'): Promise<AIResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider === 'ollama' ? {
          model: 'mistral', // User can change this later
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

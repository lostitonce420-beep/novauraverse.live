import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { requireAuth } from '../middleware/jwt';
import type { Bindings } from '../index';

const ai = new Hono<{ Bindings: Bindings }>();

// ── POST /ai/chat — proxy text generation to any provider ───────────────────
ai.post('/chat', requireAuth, async (c) => {
  const { provider, model, prompt, maxTokens = 1024, temperature = 0.7 } = await c.req.json();

  if (!provider || !prompt) {
    return c.json({ error: 'Provider and prompt are required.' }, 400);
  }

  const envVars = env<Bindings>(c);

  try {
    if (provider === 'gemini') {
      const apiKey = envVars.GEMINI_API_KEY;
      if (!apiKey) return c.json({ error: 'Gemini API not configured.' }, 503);

      const geminiModel = model || 'gemini-3.0-flash';
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature, topP: 0.8, topK: 40, maxOutputTokens: maxTokens },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return c.json({ error: `Gemini API Error: ${res.status} ${(err as any).error?.message || ''}` }, 502);
      }

      const data = await res.json() as any;
      return c.json({ content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
    }

    if (provider === 'claude') {
      const apiKey = envVars.CLAUDE_API_KEY;
      if (!apiKey) return c.json({ error: 'Claude API not configured.' }, 503);

      const claudeModel = model || 'claude-haiku-4-5-20251001';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: claudeModel,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return c.json({ error: `Claude API Error: ${res.status} ${(err as any).error?.message || ''}` }, 502);
      }

      const data = await res.json() as any;
      return c.json({ content: data.content?.[0]?.text || '' });
    }

    if (provider === 'openai') {
      const apiKey = envVars.OPENAI_API_KEY;
      if (!apiKey) return c.json({ error: 'OpenAI API not configured.' }, 503);

      const openaiModel = model || 'gpt-4o';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return c.json({ error: `OpenAI API Error: ${res.status} ${(err as any).error?.message || ''}` }, 502);
      }

      const data = await res.json() as any;
      return c.json({ content: data.choices?.[0]?.message?.content || '' });
    }

    if (provider === 'kimi') {
      const apiKey = envVars.KIMI_API_KEY;
      if (!apiKey) return c.json({ error: 'Kimi API not configured.' }, 503);

      const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'moonshot-v1-8k',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        return c.json({ error: `Kimi API Error: ${res.status}` }, 502);
      }

      const data = await res.json() as any;
      return c.json({ content: data.choices?.[0]?.message?.content || '' });
    }

    if (provider === 'vertex') {
      const apiKey = envVars.VERTEX_AI_KEY;
      const projectId = envVars.VERTEX_PROJECT_ID;
      if (!apiKey) return c.json({ error: 'Vertex AI not configured.' }, 503);

      const vertexModel = model || 'gemini-2.0-flash';
      const url = projectId
        ? `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${vertexModel}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${vertexModel}:generateContent?key=${apiKey}`;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (projectId) headers['Authorization'] = `Bearer ${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return c.json({ error: `Vertex AI Error: ${res.status} ${(err as any).error?.message || ''}` }, 502);
      }

      const data = await res.json() as any;
      return c.json({ content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
    }

    return c.json({ error: `Unknown provider: ${provider}` }, 400);
  } catch (err: any) {
    console.error('AI proxy error:', err);
    return c.json({ error: `AI request failed: ${err.message}` }, 502);
  }
});

// ── POST /ai/image — proxy image generation (Vertex Imagen) ─────────────────
ai.post('/image', requireAuth, async (c) => {
  const { prompt } = await c.req.json();
  if (!prompt) return c.json({ error: 'Prompt is required.' }, 400);

  const envVars = env<Bindings>(c);
  const apiKey = envVars.VERTEX_AI_KEY;
  const projectId = envVars.VERTEX_PROJECT_ID;

  if (!apiKey || !projectId) {
    return c.json({ error: 'Vertex AI not configured for image generation.' }, 503);
  }

  try {
    const res = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '1:1' },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return c.json({ error: `Imagen Error: ${res.status} ${(err as any).error?.message || ''}` }, 502);
    }

    const data = await res.json() as any;
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return c.json({ error: 'No image returned.' }, 502);

    return c.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (err: any) {
    console.error('Imagen proxy error:', err);
    return c.json({ error: `Image generation failed: ${err.message}` }, 502);
  }
});

export default ai;

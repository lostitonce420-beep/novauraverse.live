import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './routes/auth';
import assetsRoutes from './routes/assets';
import ordersRoutes from './routes/orders';
import domainsRoutes from './routes/domains';
import aiRoutes from './routes/ai';

export type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  NAMESILO_API_KEY?: string;
  GEMINI_API_KEY?: string;
  CLAUDE_API_KEY?: string;
  OPENAI_API_KEY?: string;
  KIMI_API_KEY?: string;
  VERTEX_AI_KEY?: string;
  VERTEX_PROJECT_ID?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  const origin = c.env.FRONTEND_URL || 'http://localhost:5173';
  return cors({
    origin,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next);
});

app.use('*', logger());

app.route('/auth', authRoutes);
app.route('/assets', assetsRoutes);
app.route('/orders', ordersRoutes);
app.route('/domains', domainsRoutes);
app.route('/ai', aiRoutes);

app.get('/health', (c) => c.json({
  status: 'ok',
  service: 'novaura-api',
  timestamp: new Date().toISOString(),
}));

export default app;

import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' }); // MUST be before all other imports

import './sentry';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Sentry } from './sentry';
import { GoogleGenAI } from '@google/genai';
import { GenerateRequest, RefineRequest, ArchitectureJSON } from './types';
import { buildSystemPrompt, buildRefinePrompt, assignLayerColors } from './promptBuilder';
import {
  isSupabaseConfigured,
  saveArchitectureToDB,
  updateArchitectureInDB,
  logFeedbackToDB,
  getRecentFeedbacks,
  getHistoryFromDB,
  verifyUserToken,
} from './supabase';

const app = express();
const PORT = process.env.PORT || 3001;
const PROMPT_VERSION = 'v1';

// ── Rate limiter ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    next(); return;
  }
  if (record.count >= RATE_LIMIT) {
    res.status(429).json({ error: 'Rate limit exceeded. Try again in an hour.', code: 'RATE_LIMIT' });
    return;
  }
  record.count += 1;
  next();
}

// ── Auth middleware (optional — attaches userId if token present) ──────────────
async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    const userId = await verifyUserToken(token);
    if (userId) (req as Request & { userId?: string }).userId = userId;
  }
  next();
}

// ── Middleware ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,           // set in Vercel dashboard
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (covers preview deployments too)
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors());

app.use(express.json({ limit: '2mb' }));

// ── Gemma 3 client (@google/genai SDK) ───────────────────────────────────────
let _genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set. Add it to Vercel Environment Variables.');
    _genAI = new GoogleGenAI({ apiKey });
  }
  return _genAI;
}

async function callGemini(systemPrompt: string, userMessage: string): Promise<ArchitectureJSON> {
  // Inline system prompt into user turn (Gemma 3 doesn't use systemInstruction)
  const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;
  const result = await getGenAI().models.generateContent({
    model: 'models/gemma-3-27b-it',   // Gemma 3 — 27B instruction-tuned
    contents: fullPrompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
  const text = result.text ?? '';
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return assignLayerColors(JSON.parse(cleaned));
  } catch {
    throw new Error('Gemma 3 returned invalid JSON. Please try again.');
  }

}

// ── Routes ─────────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({ name: 'Architecture Mapper API', status: 'ok', version: '1.0.0' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: isSupabaseConfigured ? 'connected' : 'not configured',
  });
});

// POST /api/generate
app.post('/api/generate', rateLimiter, optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { idea, projectType, scale } = req.body as GenerateRequest;
  const userId = (req as Request & { userId?: string }).userId;

  if (!idea || !projectType || !scale) {
    res.status(400).json({ error: 'Missing required fields: idea, projectType, scale', code: 'VALIDATION_ERROR' });
    return;
  }
  if (idea.length > 2000) {
    res.status(400).json({ error: 'Idea too long (max 2000 chars)', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    // Pull persisted feedbacks for logged-in users, fall back to request body
    const pastFeedbacks = userId
      ? await getRecentFeedbacks(userId)
      : (req.body.pastFeedbacks || []);

    const systemPrompt = buildSystemPrompt(pastFeedbacks);
    const userMessage = `PROJECT IDEA: ${idea}\nPROJECT TYPE: ${projectType}\nSCALE: ${scale}`;
    const arch = await callGemini(systemPrompt, userMessage);

    // Auto-save to DB
    let archId: string | null = null;
    if (userId && isSupabaseConfigured) {
      const slug = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      archId = await saveArchitectureToDB({
        userId, arch, title: arch.title,
        projectType: arch.projectType, scale: arch.scale,
        version: arch.version, shareSlug: slug,
        promptVersion: PROMPT_VERSION,
      });
    }

    res.json({ ...arch, _archId: archId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/generate]', message);
    res.status(500).json({ error: message, code: 'GENERATION_ERROR' });
  }
});

// POST /api/refine
app.post('/api/refine', rateLimiter, optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { existingArch, feedback, archId } = req.body as RefineRequest & { archId?: string };
  const userId = (req as Request & { userId?: string }).userId;

  if (!existingArch || !feedback) {
    res.status(400).json({ error: 'Missing required fields: existingArch, feedback', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const pastFeedbacks = userId
      ? await getRecentFeedbacks(userId)
      : (req.body.pastFeedbacks || []);

    const systemPrompt = buildSystemPrompt(pastFeedbacks);
    const userMessage = `EXISTING ARCHITECTURE:\n${JSON.stringify(existingArch, null, 2)}\n\n${buildRefinePrompt(feedback, existingArch.version || 1)}`;
    const arch = await callGemini(systemPrompt, userMessage);

    // Log feedback + update arch in DB
    if (userId && isSupabaseConfigured) {
      if (archId) {
        await logFeedbackToDB({ archId, userId, message: feedback });
        await updateArchitectureInDB({ archId, userId, arch, version: arch.version });
      }
    }

    res.json({ ...arch, _archId: archId || null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/refine]', message);
    res.status(500).json({ error: message, code: 'REFINEMENT_ERROR' });
  }
});

// GET /api/history — logged-in users only
app.get('/api/history', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    return;
  }
  try {
    const history = await getHistoryFromDB(userId);
    res.json(history);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message, code: 'HISTORY_ERROR' });
  }
});

// ── Sentry error capture + generic fallback ───────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  try { Sentry.captureException(err); } catch { /* ignore Sentry errors */ }
  console.error('[unhandled]', err.message);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// ── Local dev server (skipped on Vercel) ──────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Architecture Mapper API  →  http://localhost:${PORT}`);
    console.log(`   Gemma 3 key  : ${process.env.GEMINI_API_KEY ? '✓ set' : '✗ MISSING'}`);
    console.log(`   Supabase      : ${isSupabaseConfigured ? '✓ connected' : '○ not configured (optional)'}`);
    console.log();
  });
}

// ── Vercel serverless export ───────────────────────────────────────────────────
export default app;

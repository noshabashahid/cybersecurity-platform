/**
 * aiService.js
 * ---------------------------------------------------------------------
 * Central AI analysis abstraction.
 *
 * If AI_API_KEY is configured in .env, requests are sent to an
 * Anthropic-compatible /v1/messages endpoint with a strict
 * "respond with JSON only" system prompt, and the model's structured
 * JSON reply is parsed and returned.
 *
 * If no key is configured (or the call fails), analysis falls back to
 * a transparent, rule-based heuristic engine so the application stays
 * fully usable in demo/offline mode. Fallback results are always
 * tagged aiMode: 'fallback' so the frontend can label them clearly as
 * automated/demo analysis rather than pretending they came from an AI
 * provider.
 * ---------------------------------------------------------------------
 */

const fetch = require('node-fetch');

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'https://api.anthropic.com/v1/messages';
const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-4-6';

const isAiConfigured = () => Boolean(AI_API_KEY);

// ---------------------------------------------------------------------
// Shared keyword banks used by the fallback engine
// ---------------------------------------------------------------------
const URGENCY_WORDS = ['urgent', 'immediately', 'act now', 'expire', 'expires', 'within 24 hours', 'final notice', 'last chance', 'suspended', 'suspend', 'locked', 'verify now'];
const CREDENTIAL_WORDS = ['password', 'otp', 'one-time code', 'verification code', 'pin number', 'login details', 'confirm your account', 'social security', 'cvv', 'card number'];
const FINANCIAL_WORDS = ['bank account', 'wire transfer', 'payment', 'invoice', 'refund', 'gift card', 'bitcoin', 'crypto', 'tax refund', 'inheritance'];
const THREAT_WORDS = ['account will be closed', 'legal action', 'suspended', 'unauthorized access detected', 'unusual activity', 'your account has been limited'];
const REWARD_WORDS = ['you won', 'winner', 'claim your prize', 'free gift', 'congratulations', 'selected to receive'];
const IMPERSONATION_BRANDS = ['paypal', 'amazon', 'apple', 'microsoft', 'bank', 'netflix', 'google', 'facebook', 'instagram', 'whatsapp', 'irs', 'fedex', 'dhl', 'hr department', 'it department', 'ceo'];
const ROMANCE_WORDS = ['my love', 'soulmate', 'lonely', 'send money', 'i love you', 'meet in person soon', 'stuck overseas'];
const JOB_SCAM_WORDS = ['work from home', 'easy money', 'no experience needed', 'earn $', 'processing fee', 'registration fee', 'hiring immediately'];

function countMatches(text, words) {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w));
}

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreToLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  if (score >= 15) return 'LOW';
  return 'SAFE';
}

// ---------------------------------------------------------------------
// Generic call to the configured AI provider. Returns parsed JSON or
// throws — callers should catch and fall back.
// ---------------------------------------------------------------------
async function callAI(systemPrompt, userPrompt, { imageBase64, imageMediaType } = {}) {
  if (!isAiConfigured()) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const content = [];
  if (imageBase64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: imageMediaType || 'image/png', data: imageBase64 },
    });
  }
  content.push({ type: 'text', text: userPrompt });

  const response = await fetch(AI_API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
    timeout: 20000,
  });

  if (!response.ok) {
    throw new Error(`AI_REQUEST_FAILED_${response.status}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  if (!textBlock) throw new Error('AI_EMPTY_RESPONSE');

  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

const JSON_SHAPE_INSTRUCTIONS = `Respond ONLY with a raw JSON object (no markdown, no preamble) matching exactly this shape:
{
  "riskScore": <integer 0-100>,
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "verdict": "<one short sentence>",
  "threats": ["<indicator 1>", "<indicator 2>", ...],
  "explanation": "<2-4 sentence explanation>",
  "recommendations": ["<action 1>", "<action 2>", ...]
}`;

// =======================================================================
// 1. PHISHING EMAIL ANALYSIS
// =======================================================================
async function analyzePhishingEmail({ senderEmail, recipientEmail, subject, body, suspiciousUrl }) {
  const fullText = `Sender: ${senderEmail}\nSubject: ${subject}\nBody: ${body}\nLink: ${suspiciousUrl || ''}`;

  if (isAiConfigured()) {
    try {
      const result = await callAI(
        'You are a cybersecurity analyst detecting phishing emails. ' + JSON_SHAPE_INSTRUCTIONS,
        `Analyze this email for phishing indicators (urgency, credential/OTP requests, brand impersonation, threats, suspicious links, grammar-based social engineering, fake rewards):\n\n${fullText}`
      );
      return normalizeAiResult(result, 'ai');
    } catch (err) {
      console.warn('[aiService] Falling back for phishing analysis:', err.message);
    }
  }

  return fallbackPhishingAnalysis({ senderEmail, subject, body, suspiciousUrl, fullText });
}

function fallbackPhishingAnalysis({ senderEmail, subject, body, suspiciousUrl, fullText }) {
  let score = 0;
  const threats = [];

  const urgency = countMatches(fullText, URGENCY_WORDS);
  if (urgency.length) { score += 20; threats.push('Urgency / pressure language detected'); }

  const creds = countMatches(fullText, CREDENTIAL_WORDS);
  if (creds.length) { score += 30; threats.push('Requests for password, OTP, or credential-like information'); }

  const financial = countMatches(fullText, FINANCIAL_WORDS);
  if (financial.length) { score += 15; threats.push('Financial/payment-related request'); }

  const threatLang = countMatches(fullText, THREAT_WORDS);
  if (threatLang.length) { score += 15; threats.push('Account suspension / threatening language'); }

  const rewards = countMatches(fullText, REWARD_WORDS);
  if (rewards.length) { score += 15; threats.push('Fake reward or prize claim'); }

  const brands = countMatches(fullText, IMPERSONATION_BRANDS);
  const senderDomain = (senderEmail.split('@')[1] || '').toLowerCase();
  const brandMismatch = brands.some((b) => !senderDomain.includes(b.replace(/\s/g, '')));
  if (brands.length && brandMismatch) { score += 20; threats.push('Possible brand impersonation (sender domain does not match claimed brand)'); }

  if (suspiciousUrl) {
    if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(suspiciousUrl)) { score += 20; threats.push('Link uses a raw IP address instead of a domain'); }
    if (!/^https:\/\//.test(suspiciousUrl)) { score += 10; threats.push('Link does not use HTTPS'); }
    if (/bit\.ly|tinyurl|t\.co|goo\.gl/.test(suspiciousUrl)) { score += 10; threats.push('Shortened URL obscures the real destination'); }
  }

  if (!senderDomain || senderDomain.split('.').length < 2) { score += 10; threats.push('Sender address looks malformed or suspicious'); }

  score = clampScore(score);
  const riskLevel = scoreToLevel(score);

  return {
    riskScore: score,
    riskLevel,
    verdict: riskLevel === 'SAFE'
      ? 'No strong phishing indicators detected.'
      : 'Potential phishing attempt detected — review carefully before acting.',
    threats: threats.length ? threats : ['No specific indicators matched — always verify unexpected requests independently.'],
    explanation: buildExplanation('email', threats, riskLevel),
    recommendations: buildRecommendations(riskLevel, 'email'),
    aiMode: 'fallback',
  };
}

// =======================================================================
// 2. MESSAGE ANALYSIS (SMS / WhatsApp / social platforms)
// =======================================================================
async function analyzeMessage({ platform, messageText }) {
  if (isAiConfigured()) {
    try {
      const result = await callAI(
        'You are a cybersecurity analyst detecting scam and social-engineering messages. ' + JSON_SHAPE_INSTRUCTIONS,
        `Analyze this ${platform || 'chat'} message for manipulation, social engineering, financial/romance/job scams, OTP or credential requests, and psychological pressure tactics:\n\n${messageText}`
      );
      return normalizeAiResult(result, 'ai');
    } catch (err) {
      console.warn('[aiService] Falling back for message analysis:', err.message);
    }
  }
  return fallbackMessageAnalysis({ messageText });
}

function fallbackMessageAnalysis({ messageText }) {
  let score = 0;
  const threats = [];

  const urgency = countMatches(messageText, URGENCY_WORDS);
  if (urgency.length) { score += 15; threats.push('Urgency / emotional pressure detected'); }

  const creds = countMatches(messageText, CREDENTIAL_WORDS);
  if (creds.length) { score += 30; threats.push('Requests for OTP, password, or verification code'); }

  const financial = countMatches(messageText, FINANCIAL_WORDS);
  if (financial.length) { score += 20; threats.push('Financial request (payment, transfer, gift card, crypto)'); }

  const romance = countMatches(messageText, ROMANCE_WORDS);
  if (romance.length) { score += 20; threats.push('Romance-scam style language'); }

  const job = countMatches(messageText, JOB_SCAM_WORDS);
  if (job.length) { score += 20; threats.push('Job-scam style language (upfront fees, unrealistic pay)'); }

  const rewards = countMatches(messageText, REWARD_WORDS);
  if (rewards.length) { score += 15; threats.push('Fake giveaway or prize claim'); }

  const urlMatch = messageText.match(/https?:\/\/[^\s]+/g);
  if (urlMatch && urlMatch.length) { score += 10; threats.push('Contains an embedded link — verify before clicking'); }

  score = clampScore(score);
  const riskLevel = scoreToLevel(score);

  return {
    riskScore: score,
    riskLevel,
    verdict: riskLevel === 'SAFE'
      ? 'No strong manipulation or scam indicators detected.'
      : 'Message shows signs of manipulation or scam tactics.',
    threats: threats.length ? threats : ['No specific indicators matched — stay cautious with unsolicited messages regardless.'],
    explanation: buildExplanation('message', threats, riskLevel),
    recommendations: buildRecommendations(riskLevel, 'message'),
    aiMode: 'fallback',
  };
}

// =======================================================================
// 3. SCREENSHOT / IMAGE ANALYSIS
// =======================================================================
async function analyzeScreenshot({ imageBase64, imageMediaType }) {
  if (isAiConfigured()) {
    try {
      const result = await callAI(
        'You are a cybersecurity analyst. Examine the screenshot for phishing/scam indicators. ' + JSON_SHAPE_INSTRUCTIONS,
        'Analyze this screenshot for: fake login pages, phishing forms, suspicious/lookalike URLs, brand impersonation, fake security warnings, fake payment or OTP requests, urgency tactics, and other social-engineering visual patterns.',
        { imageBase64, imageMediaType }
      );
      return normalizeAiResult(result, 'ai');
    } catch (err) {
      console.warn('[aiService] Falling back for screenshot analysis:', err.message);
    }
  }

  // Fallback: we cannot "see" the image without a vision API, so we
  // return a clearly-labeled demo assessment instructing the user on
  // what to check manually, rather than fabricating a false AI verdict.
  return {
    riskScore: 50,
    riskLevel: 'MEDIUM',
    verdict: 'Demo mode: automatic visual analysis is unavailable without an AI vision API key.',
    threats: ['AI vision analysis not configured — manual review recommended'],
    explanation:
      'No AI_API_KEY is configured, so this screenshot could not be analyzed automatically. ' +
      'This is a fallback/demo result, not a real assessment of the uploaded image. ' +
      'Configure AI_API_KEY in the backend .env file to enable real AI-powered screenshot analysis.',
    recommendations: [
      'Manually check the URL/domain shown in the screenshot for misspellings',
      'Look for missing HTTPS or a mismatched sender/brand name',
      'Never enter passwords or OTPs into a page you reached via an unsolicited link',
      'Configure AI_API_KEY to enable automatic screenshot analysis',
    ],
    aiMode: 'fallback',
  };
}

// =======================================================================
// Helpers
// =======================================================================
function normalizeAiResult(result, mode) {
  return {
    riskScore: clampScore(Number(result.riskScore) || 0),
    riskLevel: result.riskLevel && ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(result.riskLevel)
      ? result.riskLevel
      : scoreToLevel(Number(result.riskScore) || 0),
    verdict: result.verdict || 'Analysis complete.',
    threats: Array.isArray(result.threats) ? result.threats : [],
    explanation: result.explanation || '',
    recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    aiMode: mode,
  };
}

function buildExplanation(kind, threats, riskLevel) {
  if (riskLevel === 'SAFE') {
    return `This ${kind} was scanned using the built-in rule-based fallback engine and did not match common phishing/scam/social-engineering patterns. This does not guarantee full safety — always stay alert with unexpected requests.`;
  }
  return `This ${kind} was scanned using the built-in rule-based fallback engine and matched ${threats.length} known risk pattern(s): ${threats.join('; ')}. Treat this as an automated heuristic assessment, not a certified verdict — when in doubt, verify independently.`;
}

function buildRecommendations(riskLevel, kind) {
  const base = [
    'Do not share passwords, OTPs, or banking information based on this content.',
    'Verify the sender/requester through a separate, trusted channel.',
  ];
  if (riskLevel === 'SAFE') {
    return ['No major red flags detected, but always stay cautious with unexpected requests.', 'Enable multi-factor authentication on your important accounts.'];
  }
  if (riskLevel === 'LOW' || riskLevel === 'MEDIUM') {
    return [...base, 'Avoid clicking any links until you have verified the source.'];
  }
  return [...base, `Do not respond to this ${kind}.`, 'Report and delete it, and change any credentials you may have already shared.'];
}

module.exports = {
  isAiConfigured,
  analyzePhishingEmail,
  analyzeMessage,
  analyzeScreenshot,
};

// Vercel serverless function — POST /api/send
// Sends a single email via SMTP using nodemailer.
//
// Required Vercel environment variables (Project → Settings → Environment Variables):
//   SMTP_HOST       e.g. smtp.gmail.com
//   SMTP_PORT       e.g. 465 (SSL) or 587 (TLS)
//   SMTP_USER       full email address used to authenticate
//   SMTP_PASS       app-password / SMTP password (NOT your normal Gmail password)
//   SMTP_SECURE     "true" for 465, "false" for 587 (default: true if port=465)
//   SMTP_FROM       optional default From address; falls back to SMTP_USER
//
// Optional protection:
//   API_AUTH_TOKEN  if set, requests must include header `x-api-token: <value>`
//
// POST body (application/json):
//   { from?, to, cc?, bcc?, subject, text?, html? }
//
// Returns: 200 { ok:true, messageId } | 4xx/5xx { ok:false, error }

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS — same-origin by default; if you put a different domain in front, narrow this.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-api-token');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Optional shared-secret guard
  const required = process.env.API_AUTH_TOKEN;
  if (required) {
    const got = req.headers['x-api-token'];
    if (got !== required) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  // Parse body — Vercel parses JSON automatically when content-type is application/json
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }
  }
  body = body || {};

  const { from, to, cc, bcc, subject, text, html } = body;
  if (!to)      return res.status(400).json({ ok: false, error: 'Missing "to"' });
  if (!subject) return res.status(400).json({ ok: false, error: 'Missing "subject"' });
  if (!text && !html) return res.status(400).json({ ok: false, error: 'Missing body — provide "text" or "html"' });

  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !portStr || !user || !pass) {
    return res.status(500).json({
      ok: false,
      error: 'SMTP env vars missing — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in Vercel project settings.',
    });
  }
  const port = Number(portStr);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  const transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
      from: from || process.env.SMTP_FROM || user,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      text: text || undefined,
      html: html || undefined,
    });
    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'SMTP send failed' });
  }
};

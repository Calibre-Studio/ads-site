// Calibre Studio — Calendly → OpenAI Ads Conversions API bridge
// Receives Calendly webhooks (invitee.created), extracts the OpenAI attribution
// identifiers packed into utm_term by the site script ("eid:<id>|op:<oppref>"),
// hashes the invitee email (SHA-256), and posts server-side conversion events:
//   - lead_created            (id = eid  → dedupes with the browser pixel event)
//   - appointment_scheduled   (id = appt_<eid> → the actual booking signal)
// Env vars required: OAI_PIXEL_ID, OAI_CONVERSION_KEY (or OAI_CAPI_KEY)

const crypto = require('crypto');

const CAPI_KEY = () => process.env.OAI_CONVERSION_KEY || process.env.OAI_CAPI_KEY || '';

const ENDPOINT = 'https://bzr.openai.com/v1/events';

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function parseTerm(term) {
  const out = { eid: null, op: null };
  if (!term) return out;
  const eid = term.match(/eid:([^|]+)/);
  const op = term.match(/op:([^|]+)/);
  if (eid) out.eid = eid[1];
  if (op) out.op = op[1];
  return out;
}

async function postEvents(events, validateOnly) {
  const url = `${ENDPOINT}?pid=${encodeURIComponent(process.env.OAI_PIXEL_ID || '')}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CAPI_KEY()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ validate_only: !!validateOnly, events }),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, body: text.slice(0, 500) };
}

module.exports = async (req, res) => {
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'calibre-capi',
      env: {
        pixel: !!process.env.OAI_PIXEL_ID,
        key: !!CAPI_KEY(),
      },
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const body = req.body || {};
    const validateOnly = req.query && req.query.validate === '1';

    // Only act on completed bookings
    if (body.event && body.event !== 'invitee.created') {
      return res.status(200).json({ ok: true, skipped: body.event });
    }

    const p = body.payload || {};
    const tracking = p.tracking || {};
    const { eid, op } = parseTerm(tracking.utm_term || '');
    const email = (p.email || '').trim().toLowerCase();
    const when = p.created_at ? Date.parse(p.created_at) : Date.now();
    const ts = Number.isFinite(when) ? when : Date.now();
    const baseId = eid || 'srv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);

    function makeEvent(type, id) {
      const ev = {
        id,
        type,
        timestamp_ms: ts,
        source_url: 'https://www.calibrestudio.co/',
        action_source: 'web',
        data: { type: 'customer_action' },
      };
      if (op) ev.oppref = op;
      if (email) ev.user = { email: sha256(email) };
      return ev;
    }

    let events = [
      makeEvent('lead_created', baseId),
      makeEvent('appointment_scheduled', 'appt_' + baseId),
    ];

    let result = await postEvents(events, validateOnly);

    // If the user field shape is rejected, retry without it (oppref still attributes)
    if (!result.ok && /user/i.test(result.body)) {
      events = events.map((e) => {
        const c = { ...e };
        delete c.user;
        return c;
      });
      const retry = await postEvents(events, validateOnly);
      return res.status(200).json({ ok: retry.ok, mode: 'no-user-retry', first: result, second: retry, eid: baseId, hadOppref: !!op, hadEmail: !!email });
    }

    return res.status(200).json({ ok: result.ok, result, eid: baseId, hadOppref: !!op, hadEmail: !!email, validateOnly });
  } catch (e) {
    // Always 200 so Calendly doesn't retry-storm; error is in the body for logs
    return res.status(200).json({ ok: false, error: String(e) });
  }
};

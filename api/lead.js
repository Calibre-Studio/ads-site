// Vercel serverless function: receives the ads.calibrestudio.co lead form and
// upserts the contact into GoHighLevel. No secrets live in the page.
//
// Set in Vercel -> ads-site -> Settings -> Environment Variables (Production):
//   HL_TOKEN       = a GoHighLevel Private Integration token (scopes: contacts.write, contacts.readonly)
//   HL_LOCATION_ID = the sub-account (location) id these leads belong to
// Then redeploy.

const HL_BASE = "https://services.leadconnectorhq.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.HL_TOKEN;
  const locationId = process.env.HL_LOCATION_ID || "Nkqs3PaT8ZGuWq582ive"; // Calibre Studio sub-account
  if (!token || !locationId) {
    return res.status(500).json({ ok: false, error: "Lead capture is not configured yet." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (err) { body = {}; }
  }
  body = body || {};

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const website = String(body.website || "").trim();
  const markets = String(body.markets || "").trim();
  const message = String(body.message || "").trim();

  if (!email) return res.status(400).json({ ok: false, error: "Email is required." });

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || undefined;
  const lastName = parts.length ? parts.join(" ") : undefined;

  function hl(path, payload) {
    return fetch(HL_BASE + path, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
  }

  try {
    const up = await hl("/contacts/upsert", {
      locationId: locationId,
      email: email,
      firstName: firstName,
      lastName: lastName,
      name: name || undefined,
      website: website || undefined,
      source: "ChatGPT Ads landing (ads.calibrestudio.co)",
      tags: ["chatgpt-ads", "ads.calibrestudio.co"]
    });

    const upJson = await up.json().catch(function () { return {}; });
    if (!up.ok) {
      return res.status(502).json({ ok: false, error: "CRM rejected the lead." });
    }

    const contactId = (upJson && upJson.contact && upJson.contact.id) || (upJson && upJson.id);

    if (contactId && (website || markets || message)) {
      const note =
        "New ChatGPT Ads enquiry\n" +
        "Website: " + (website || "-") + "\n" +
        "Sells in: " + (markets || "-") + "\n" +
        "Goal: " + (message || "-");
      await hl("/contacts/" + contactId + "/notes", { body: note }).catch(function () {});
    }

    // Server-side Conversions API (ad-blocker-proof). Dedupes with the browser pixel via shared event_id.
    const oaiKey = process.env.OAI_CONVERSION_KEY;
    const pixelId = process.env.OAI_PIXEL_ID || "9BcrW881wcT7tsruuiAxCV";
    if (oaiKey) {
      const eventId = String(body.event_id || "").trim() || ("srv-" + Date.now());
      const sourceUrl = String(body.page_url || "").trim() || "https://ads.calibrestudio.co/";
      try {
        await fetch("https://bzr.openai.com/v1/events?pid=" + pixelId, {
          method: "POST",
          headers: { Authorization: "Bearer " + oaiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            validate_only: false,
            events: [{
              id: eventId,
              type: "lead_created",
              timestamp_ms: Date.now(),
              source_url: sourceUrl,
              action_source: "web",
              data: { type: "customer_action" }
            }]
          })
        });
      } catch (e) { /* best effort: never block the lead on tracking */ }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Something went wrong. Please try again." });
  }
}

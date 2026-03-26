export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, segment, source } = req.body || {};
  if (!email) return res.status(400).json({ error: "No email" });

  const payload = {
    email: String(email).trim(),
    name: name || null,
    segment: segment || null,
    source: source || null,
  };

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/waitlist_signups`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    }
  );

  // Supabase/PostgREST can return 409 for a conflict (often "already exists" if a unique constraint is present).
  // Treat that as success so users don't get blocked when they retry / already signed up.
  if (response.status === 409) {
    return res.status(200).json({ success: true, alreadyOnList: true });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const details = text || undefined;
    // 400 is commonly constraint/validation related (e.g., email format check).
    if (response.status === 400) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
        details,
      });
    }
    return res.status(500).json({
      error: "Failed to add to waitlist",
      details,
    });
  }

  return res.status(200).json({ success: true });
}

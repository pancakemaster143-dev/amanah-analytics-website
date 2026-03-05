export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, segment, source } = req.body || {};
  if (!email) return res.status(400).json({ error: "No email" });

  const payload = {
    email,
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

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return res
      .status(500)
      .json({ error: "Failed to add to waitlist", details: text || undefined });
  }

  return res.status(200).json({ success: true });
}

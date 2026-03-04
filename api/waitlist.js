export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "No email" });

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name }),
  });

  return res.status(200).json({ success: true });
}

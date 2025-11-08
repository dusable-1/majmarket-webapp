export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false });
  const { telegram_id, username } = req.body || {};
  if (!telegram_id) return res.status(400).json({ ok:false, error:'telegram_id missing' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(500).json({ ok:false, error:'supabase env missing' });

  const headers = { apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json', Prefer:'resolution=merge-duplicates' };

  const resp = await fetch(`${url}/rest/v1/users`, {
    method:'POST', headers, body: JSON.stringify({ telegram_id, username })
  });

  if (!resp.ok) return res.status(500).json({ ok:false, error:await resp.text() });
  return res.status(200).json({ ok:true });
}

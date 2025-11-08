export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(500).json({ ok:false, error:'supabase env missing' });

  const headers = { apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json' };

  if (req.method === 'GET') {
    const r = await fetch(`${url}/rest/v1/listings?select=*&status=eq.active&order=created_at.desc`, { headers });
    const data = await r.json();
    return res.status(200).json({ ok:true, data });
  }

  if (req.method === 'POST') {
    const { seller_id, title, price_mjt, category, server } = req.body || {};
    if (!seller_id || !title || !price_mjt || !category || !server) {
      return res.status(400).json({ ok:false, error:'missing fields' });
    }
    const r = await fetch(`${url}/rest/v1/listings`, {
      method:'POST', headers, body:JSON.stringify({ seller_id, title, price_mjt, category, server })
    });
    if (!r.ok) return res.status(500).json({ ok:false, error:await r.text() });
    const data = await r.json();
    return res.status(200).json({ ok:true, data:data[0] });
  }

  return res.status(405).json({ ok:false });
}

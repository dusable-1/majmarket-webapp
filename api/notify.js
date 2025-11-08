export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
    const { chat_id, text } = req.body || {};
    if (!chat_id || !text) return res.status(400).json({ ok:false, error:'chat_id or text missing' });

    const token = process.env.BOT_TOKEN;
    if (!token) return res.status(500).json({ ok:false, error:'BOT_TOKEN not set' });

    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id, text, disable_web_page_preview:true })
    });
    const data = await r.json();
    if (!data.ok) return res.status(500).json({ ok:false, error:data.description });

    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error:String(e) });
  }
}

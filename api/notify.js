export default async function handler(req, res) {
  try{
    const { chat_id, text } = req.body || {};
    if(!chat_id || !text) return res.status(400).json({ok:false, error:'bad params'});
    const token = process.env.BOT_TOKEN;
    if(!token) return res.status(500).json({ok:false, error:'BOT_TOKEN missing'});
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id, text, parse_mode:'HTML' })
    });
    const j = await r.json();
    res.status(200).json({ok:true, tg:j});
  }catch(e){
    res.status(500).json({ok:false, error:'server'});
  }
}

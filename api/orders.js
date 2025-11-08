export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const botToken = process.env.BOT_TOKEN;
  if (!url || !key) return res.status(500).json({ ok:false, error:'supabase env missing' });

  const headers = { apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json' };

  if (req.method === 'POST') {
    const { listing_id, buyer_id } = req.body || {};
    if (!listing_id || !buyer_id) return res.status(400).json({ ok:false, error:'missing fields' });

    const lr = await fetch(`${url}/rest/v1/listings?id=eq.${listing_id}&select=*`, { headers });
    const listArr = await lr.json();
    const listing = listArr && listArr[0];
    if (!listing) return res.status(404).json({ ok:false, error:'listing not found' });

    if (String(listing.seller_id) === String(buyer_id)) {
      return res.status(400).json({ ok:false, error:'cannot buy own listing' });
    }

    const or = await fetch(`${url}/rest/v1/orders`, {
      method:'POST', headers,
      body: JSON.stringify({
        listing_id,
        buyer_id,
        seller_id: listing.seller_id,
        price: listing.price_mjt,
        status: 'holded',
        buyer_confirm: false
      })
    });
    const dat = await or.json();
    const order = dat[0];

    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ chat_id: listing.seller_id, text: `Новый заказ #${String(order.id).slice(0,5)} на «${listing.title}» за ${order.price} MJT. Ожидаем подтверждение покупателя.` })
      }).catch(()=>{});
    }
    return res.status(200).json({ ok:true, data: order });
  }

  if (req.method === 'PATCH') {
    const { order_id } = req.body || {};
    if (!order_id) return res.status(400).json({ ok:false, error:'missing order_id' });

    const done = await fetch(`${url}/rest/v1/orders?id=eq.${order_id}`, {
      method:'PATCH', headers, body: JSON.stringify({ buyer_confirm:true, status:'completed' })
    });
    if (!done.ok) return res.status(500).json({ ok:false, error:await done.text() });

    if (botToken) {
      const or = await fetch(`${url}/rest/v1/orders?id=eq.${order_id}&select=buyer_id,seller_id,price`, { headers });
      const arr = await or.json();
      const n = arr && arr[0];
      const text = `Заказ #${String(order_id).slice(0,5)} завершён ✅`;
      await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chat_id: n.seller_id, text }) }),
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chat_id: n.buyer_id,  text }) })
      ]).catch(()=>{});
    }
    return res.status(200).json({ ok:true });
  }

  return res.status(405).json({ ok:false });
}

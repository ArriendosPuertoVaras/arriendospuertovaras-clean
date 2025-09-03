// api/webpay/return-callback.js
export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const token_ws =
      method === 'POST'
        ? (req.body && (req.body.token_ws || req.body.token))
        : (req.query && (req.query.token_ws || req.query.token));

    if (!token_ws) {
      return res.status(400).json({ ok: false, error: 'token_ws missing' });
    }

    const TBK_BASE_URL       = process.env.TBK_BASE_URL || 'https://webpay3gint.transbank.cl';
    const TBK_COMMERCE_CODE  = process.env.TBK_COMMERCE_CODE || '';
    const TBK_API_KEY_SECRET = process.env.TBK_API_KEY_SECRET || '';

    const commitUrl = `${TBK_BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`;
    const r = await fetch(commitUrl, {
      method: 'PUT',
      headers: {
        'Tbk-Api-Key-Id': TBK_COMMERCE_CODE,
        'Tbk-Api-Key-Secret': TBK_API_KEY_SECRET,
        'Content-Type': 'application/json',
      },
    });

    let commit = {};
    try { commit = await r.json(); } catch {}

    const ok = r.ok && commit?.status === 'AUTHORIZED' && commit?.response_code === 0;

    return res.status(200).json({ ok, token_ws, commit });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}

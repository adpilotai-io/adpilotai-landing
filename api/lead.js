export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }
  // Read the raw request body (JSON or URL encoded)
  const rawBody = await new Response(req.body).text();
  let body = {};
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    const params = new URLSearchParams(rawBody);
    params.forEach((value, key) => {
      body[key] = value;
    });
  }

  const { name, email, store } = body;
  if (!name || !email || !store) {
    res.statusCode = 400;
    res.end('Missing required fields');
    return;
  }
  // Send to webhook (Zapier or Google sheet)
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL || process.env.SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, store })
      });
    } catch (err) {
      console.error(err);
    }
  }

  res.statusCode = 302;
  res.setHeader('Location', '/thanks.html');
  res.end();
}

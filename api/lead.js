export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  let data = '';
  for await (const chunk of req) {
    data += chunk;
  }

  let body = {};
  try {
    if (data) {
      body = JSON.parse(data);
    }
  } catch (error) {
    res.statusCode = 400;
    res.end('Invalid JSON');
    return;
  }

  const { name, email, store } = body;
  if (!name || !email || !store) {
    res.statusCode = 400;
    res.end('Missing required fields');
    return;
  }

  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL || process.env.SHEET_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
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

export default async function handler(req, res) {
  const path = (req.query.path || []).join('/');
  const url = `http://157.245.72.13:8081/${path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
  const response = await fetch(url, {
    method: req.method,
    headers: { ...req.headers, host: '157.245.72.13:8081' },
  });
  const contentType = response.headers.get('content-type');
  if (contentType) res.setHeader('Content-Type', contentType);
  const body = await response.arrayBuffer();
  res.status(response.status).send(Buffer.from(body));
}

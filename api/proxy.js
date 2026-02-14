export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname;

  let target;
  if (pathname.startsWith('/app1')) {
    const path = pathname.replace(/^\/app1\/?/, '');
    target = `http://157.245.72.13:8080/${path}${url.search}`;
  } else if (pathname.startsWith('/app2')) {
    const path = pathname.replace(/^\/app2\/?/, '');
    target = `http://157.245.72.13:8081/${path}${url.search}`;
  } else {
    return res.status(404).send('Not found');
  }

  const response = await fetch(target);
  const contentType = response.headers.get('content-type');
  if (contentType) res.setHeader('Content-Type', contentType);
  const body = await response.arrayBuffer();
  res.status(response.status).send(Buffer.from(body));
}

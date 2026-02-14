export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname;

  let target, prefix;
  if (pathname.startsWith('/app1')) {
    const path = pathname.replace(/^\/app1\/?/, '');
    target = `http://157.245.72.13:8080/${path}${url.search}`;
    prefix = '/app1';
  } else if (pathname.startsWith('/app2')) {
    const path = pathname.replace(/^\/app2\/?/, '');
    target = `http://157.245.72.13:8081/${path}${url.search}`;
    prefix = '/app2';
  } else {
    return res.status(404).send('Not found');
  }

  const response = await fetch(target);
  const contentType = response.headers.get('content-type') || '';
  if (contentType) res.setHeader('Content-Type', contentType);

  if (contentType.includes('text/html')) {
    let html = await response.text();
    // Rewrite absolute paths in src, href, and action attributes
    html = html.replace(/(src|href|action)=(["'])\//g, `$1=$2${prefix}/`);
    // Rewrite url() in inline styles
    html = html.replace(/url\(\s*(['"]?)\//g, `url($1${prefix}/`);
    res.status(response.status).send(html);
  } else {
    const body = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(body));
  }
}

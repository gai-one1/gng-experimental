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

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("text/html")) {
    return response
  }

  let html = await response.text()

  const script = `
<script>
  (function() {
    // Don't run if we're already the opened copy
    if (window.__blobCopy || window.location.protocol === 'blob:' || window.location.href === 'about:blank') return;

    let opened = false;

    function tryOpen() {
      if (opened) return;
      opened = true;

      const win = window.open('about:blank', '_blank');
      if (win) {
        // Mark the clone so it doesn't re-trigger
        const cloneHtml = document.documentElement.outerHTML.replace(
          '__BLOB_GUARD__',
          'true'
        );
        win.document.open();
        win.document.write(cloneHtml);
        win.document.close();
      }
    }

    document.addEventListener('click', tryOpen, { once: true });
    tryOpen();
  })();
<\/script>`

  // Inject the guard flag + script
  const guardedScript = script.replace('let opened = false;', 'let opened = false;\n    window.__blobCopy = false;')
  
  // Also embed a detectable marker in the HTML that gets flipped in the clone
  html = html.replace(/<html/i, '<html data-blob-guard="__BLOB_GUARD__"')

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, guardedScript + '</head>')
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, guardedScript + '</body>')
  } else {
    html = guardedScript + html
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

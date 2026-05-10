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
    let opened = false;

    function tryOpen() {
      if (opened) return;
      opened = true;
      const win = window.open('about:blank', '_blank');
      if (win) {
        win.document.open();
        win.document.write(document.documentElement.outerHTML);
        win.document.close();
      }
    }

    // Try on first click
    document.addEventListener('click', tryOpen, { once: true });

    // Also try immediately (works if popups are allowed for site)
    tryOpen();
  })();
<\/script>`

  // Try </head> first, then </body>, then just prepend
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, script + '</head>')
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, script + '</body>')
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

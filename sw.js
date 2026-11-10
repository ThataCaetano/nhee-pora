// Guarda o site no aparelho para abrir sem internet. NUNCA guarda respostas do banco (Supabase).
// Páginas, scripts e configuração: tenta a internet primeiro (sempre a versão mais nova) e usa a cópia só se estiver sem rede.
// Ao publicar uma versão nova, troque o número abaixo (v3 -> v4).
const V = "nhee-v3";
const CORE = ["./", "index.html", "config.js", "manifest.json", "logo_claro.png", "logo_escuro.png", "faixa.png",
  "icon-192.png", "icon-512.png"];
const PERMITIDOS = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function guardar(req, r) {
  if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(V).then(ca => ca.put(req, c)); }
  return r;
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !PERMITIDOS.includes(u.hostname)) return; // ex.: *.supabase.co passa direto
  const dinamico = u.origin === location.origin && (e.request.mode === "navigate" || /\.(html|js|json)$/.test(u.pathname) || u.pathname.endsWith("/"));
  if (dinamico) {
    e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => guardar(e.request, r)).catch(() => caches.match(e.request).then(h => h || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => guardar(e.request, r))));
});

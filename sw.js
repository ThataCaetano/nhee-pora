// Guarda o site no aparelho para abrir sem internet. NUNCA guarda respostas do banco (Supabase).
// Ao publicar uma versão nova do site, troque o número abaixo (v2 -> v3).
const V = "nhee-v2";
const CORE = ["./", "index.html", "manifest.json", "logo_claro.png", "logo_escuro.png", "faixa.png",
  "icon-192.png", "icon-512.png"];
const PERMITIDOS = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !PERMITIDOS.includes(u.hostname)) return; // ex.: *.supabase.co passa direto
  e.respondWith(caches.match(e.request).then(hit => {
    const rede = fetch(e.request).then(r => {
      if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(V).then(ca => ca.put(e.request, c)); }
      return r;
    }).catch(() => hit);
    return hit || rede;
  }));
});

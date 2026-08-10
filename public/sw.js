const CACHE = "medical-elites-v3-subscription-resolution-20260808";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

function isCacheableSameOriginRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.mode === "navigate") return true;
  return /\.(?:js|css|svg|png|jpg|jpeg|webp|ico|woff2?|json|webmanifest)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Never intercept or cache Firebase, Flutterwave, APIs, or any other
  // cross-origin request. The previous service worker attempted to cache those
  // responses and could surface Cache.put() network errors during Firestore
  // workspace resolution and payment flows.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && isCacheableSameOriginRequest(request)) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => undefined),
          );
        }
        return response;
      })
      .catch(async () => {
        const hit = await caches.match(request);
        if (hit) return hit;
        if (request.mode === "navigate") {
          const shell = await caches.match("/index.html");
          if (shell) return shell;
          return new Response(
            "The application is temporarily offline. Please reconnect and reload.",
            { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
          );
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }),
  );
});

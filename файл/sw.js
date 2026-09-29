/* FileBridge service worker: app shell + runtime-кеш CDN (mqtt.js) */
const VERSION = "fb-v1.2.6";
const SHELL = "shell-" + VERSION;
const RUNTIME = "runtime-" + VERSION;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  // allSettled: один недоступный файл (напр. иконка ещё не залита) не должен ронять весь SW
  e.waitUntil(
    caches.open(SHELL)
      .then(c => Promise.allSettled(ASSETS.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // mqtt.js с CDN: сначала сеть, при сбое — кеш (нужен для офлайн-запуска)
  if (url.hostname === "unpkg.com") {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(RUNTIME).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // MQTT-брокеры и WebRTC-сигналинг — только сеть, не кешируем
  if (url.protocol === "wss:" || url.protocol === "ws:") return;
  if (["broker.hivemq.com", "broker.emqx.io"].includes(url.hostname)) return;

  // свой хост: сначала кеш (мгновенный старт), фоновое обновление
  if (e.request.method === "GET" && url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then(c => c.put(e.request, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    );
  }
});

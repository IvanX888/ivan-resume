/* Service Worker — «Помощник по закупкам» ЩРЗ
   Стратегия: прекэш всего приложения; для страниц — network-first (обновления приходят сразу,
   офлайн — из кэша); для статики — cache-first. Версия кэша = версия приложения.
   При смене VERSION старый кэш удаляется, клиентам показывается баннер обновления. */
var VERSION = '1.5.1';
var CACHE = 'srz-zakupki-v' + VERSION;
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('message', function(e){
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate'){
    /* страница: сначала сеть (чтобы обновления проходили), при сбое — кэш */
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put('./index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(m){ return m || caches.match('./index.html'); });
      })
    );
    return;
  }
  /* статика (иконки, манифест): сначала кэш, потом сеть с пополнением кэша */
  e.respondWith(
    caches.match(req).then(function(m){
      return m || fetch(req).then(function(res){
        if (res && res.status === 200){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
        return res;
      });
    })
  );
});

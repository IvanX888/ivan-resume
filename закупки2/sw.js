/* Service Worker, Помощник закупок v5.9.
   Страницы (html) — network-first: обновления приходят сразу, офлайн — из кэша.
   Статика (иконки, манифест) — cache-first. */
var CACHE = 'pz-v59-4';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  var isPage = e.request.mode === 'navigate' || /\.html?$/i.test(url.pathname) || url.pathname.endsWith('/');

  if(isPage){
    /* network-first для страниц: новая версия — сразу, без кэша */
    e.respondWith(
      fetch(e.request).then(function(resp){
        if(resp && resp.ok){
          var copy = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return resp;
      }).catch(function(){
        return caches.match(e.request).then(function(hit){
          return hit || caches.match('./index.html');
        });
      })
    );
  }else{
    /* cache-first для статики */
    e.respondWith(
      caches.match(e.request).then(function(hit){
        return hit || fetch(e.request).then(function(resp){
          if(resp && resp.ok){
            var copy = resp.clone();
            caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
          }
          return resp;
        });
      })
    );
  }
});

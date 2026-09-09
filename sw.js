var C = "hrtrk-v4";
var CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(C).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k !== C) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);
  var isDoc = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/sw.js");

  if(isDoc){
    // network-first: всегда пробуем свежую версию, кэш — только офлайн-запас
    e.respondWith(
      fetch(req).then(function(res){
        try{ var copy = res.clone(); caches.open(C).then(function(c){ c.put(req, copy); }); }catch(x){}
        return res;
      }).catch(function(){ return caches.match(req).then(function(hit){ return hit || caches.match("./index.html"); }); })
    );
    return;
  }

  // остальное (иконки, шрифты) — из кэша, с обновлением в фоне
  e.respondWith(
    caches.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        try{ var copy = res.clone(); caches.open(C).then(function(c){ c.put(req, copy); }); }catch(x){}
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});

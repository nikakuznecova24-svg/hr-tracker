var C = "hrtrk-v2";
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
  e.respondWith(
    caches.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        try{ var copy = res.clone(); caches.open(C).then(function(c){ c.put(req, copy); }); }catch(x){}
        return res;
      }).catch(function(){ return hit || caches.match("./index.html"); });
      return hit || net;
    })
  );
});

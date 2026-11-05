// Service Worker — كاتب المقالات
// غيّر رقم الإصدار عند تعديل أي ملف ليتحدّث التطبيق عند المستخدمين
const CACHE = 'article-writer-v3';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // طلبات الترجمة (مواقع خارجية) تمر مباشرة إلى الإنترنت
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // ملفات التطبيق: من الإنترنت أولاً، ومن الذاكرة عند انقطاع الاتصال
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

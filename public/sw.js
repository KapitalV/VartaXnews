/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Varta X News Media - Production Service Worker
 */

// Bump version on any frontend build/deployment
const CACHE_VERSION = 'vartax-v2.2.0';
const STATIC_CACHE_NAME = `vartax-static-${CACHE_VERSION}`;
const IMMUTABLE_ASSETS = [
  '/manifest.json',
  '/input_file_0.png'
];

// Install: pre-cache critical offline shell, skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(IMMUTABLE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

// Activate: clean up ALL old version caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE_NAME)
            .map((key) => {
              console.log('[SW] Purging obsolete cache:', key);
              return caches.delete(key);
            })
        );
      })
    ])
  );
});

// Fetch handler: Intelligent network-first routing strategies
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. Only handle GET requests
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  // 2. Bypass Service Worker completely for API calls, Supabase endpoints, Google AI, Google Analytics, and non-GET requests
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.searchParams.has('nocache')
  ) {
    return; // Pass through directly to network
  }

  // 3. Document / Navigation Requests (HTML pages: /, /index.html, /news/*, /admin, etc.)
  // Strategy: STRICT NETWORK-FIRST with offline fallback
  const isNavigation = 
    req.mode === 'navigate' || 
    req.destination === 'document' || 
    (req.headers.get('accept') && req.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // If valid response, clone and cache for offline fallback
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cachedResponse = await caches.match(req);
          if (cachedResponse) {
            return cachedResponse;
          }
          const rootFallback = await caches.match('/index.html');
          if (rootFallback) {
            return rootFallback;
          }
          return new Response('Offline - Varta X News Media (No network connection)', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
          });
        })
    );
    return;
  }

  // 4. Vite Hashed Assets (/assets/*)
  // Strategy: Try network, fallback to cache; or cache-first since content hash is immutable
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(req).then((networkResponse) => {
          // Only cache successful JS/CSS responses (status 200)
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Static icons, images, manifest
  if (
    url.pathname === '/manifest.json' ||
    url.pathname.startsWith('/input_file_') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(req, responseToCache).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Levant Virtual Airline - Protector Service Worker
const CACHE_NAME = 'levant-protector-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Intercept fetch requests to add security headers or block unauthorized access
self.addEventListener('fetch', (event) => {
    // We can add logic here to protect specific routes or assets
    // For now, we perform standard fetching to ensure no breakage
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Message listener for security commands
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_INTEGRITY') {
        // Perform integrity checks if needed
        event.ports[0].postMessage({ status: 'ok' });
    }
});

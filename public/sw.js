/*
 * Development-only service-worker reset.
 *
 * A previous Nuxt starter service worker can keep controlling localhost and
 * return its cached Welcome page.  Serving this valid, short-lived worker at
 * the same URL lets the browser update it, clear the old cache, unregister,
 * and reload the actual atlas.  The PWA build overwrites this file with its
 * generated offline worker in .output/public.
 */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.map((name) => caches.delete(name)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    await Promise.all(clients.map((client) => client.navigate(client.url)))
  })())
})

/**
 * Sunday Dinner Service Worker
 *
 * Basic caching strategy for PWA offline support.
 * This is a shell that will be expanded in Phase 3 (Week 9: Offline Resilience).
 *
 * Current capabilities:
 * - Cache static assets (CSS, JS, fonts) with Cache First strategy
 * - Cache HTML pages with Network First strategy
 * - Cache images with Stale While Revalidate strategy
 *
 * Future enhancements (Week 9):
 * - IndexedDB for offline task checkoffs
 * - Background sync for reconnection
 * - Push notifications for timers
 */

const CACHE_NAME = "sunday-dinner-v1";

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  // Note: Next.js generates hashed filenames for CSS/JS
  // These will be cached on first fetch instead of precache
];

// Cache strategies by request type
const CACHE_STRATEGIES = {
  // Static assets: Cache First (fast, update on new deploy)
  static: "cache-first",
  // HTML pages: Network First (fresh content, fallback to cache)
  document: "network-first",
  // Images: Stale While Revalidate (show cached, update in background)
  image: "stale-while-revalidate",
  // API calls: Network Only (always fresh, no caching)
  api: "network-only",
};

/**
 * Install event - precache essential assets
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - apply appropriate caching strategy
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (except images from Supabase storage)
  if (url.origin !== self.location.origin) {
    // Allow Supabase storage images to be cached
    if (!url.hostname.includes("supabase")) {
      return;
    }
  }

  // Determine strategy based on request type
  const strategy = getStrategy(request, url);

  switch (strategy) {
    case "cache-first":
      event.respondWith(cacheFirst(request));
      break;
    case "network-first":
      event.respondWith(networkFirst(request));
      break;
    case "stale-while-revalidate":
      event.respondWith(staleWhileRevalidate(request));
      break;
    case "network-only":
    default:
      // Let the browser handle it normally
      return;
  }
});

/**
 * Determine caching strategy for a request
 */
function getStrategy(request, url) {
  const destination = request.destination;
  const pathname = url.pathname;

  // API routes - never cache
  if (pathname.startsWith("/api/")) {
    return CACHE_STRATEGIES.api;
  }

  // Static assets - cache first
  if (
    destination === "script" ||
    destination === "style" ||
    destination === "font" ||
    pathname.startsWith("/_next/static/")
  ) {
    return CACHE_STRATEGIES.static;
  }

  // Images - stale while revalidate
  if (destination === "image") {
    return CACHE_STRATEGIES.image;
  }

  // HTML documents - network first
  if (destination === "document" || request.headers.get("accept")?.includes("text/html")) {
    return CACHE_STRATEGIES.document;
  }

  // Default to network only
  return CACHE_STRATEGIES.api;
}

/**
 * Cache First: Return cached response, fetch only if not cached
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback if available
    return caches.match("/") || new Response("Offline", { status: 503 });
  }
}

/**
 * Network First: Try network, fall back to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page
    return caches.match("/") || new Response("Offline", { status: 503 });
  }
}

/**
 * Stale While Revalidate: Return cache immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available, otherwise wait for fetch
  return cached || fetchPromise || new Response("Offline", { status: 503 });
}

/**
 * Message handler for cache control from the app
 */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }

  // Future: Handle offline queue sync messages
  if (event.data?.type === "SYNC_QUEUE") {
    // Will be implemented in Week 9
    event.ports[0]?.postMessage({ pending: true, message: "Sync not yet implemented" });
  }
});

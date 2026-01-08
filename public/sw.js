/**
 * Sunday Dinner Service Worker
 *
 * PWA offline support with active meal awareness.
 *
 * Capabilities:
 * - Cache static assets (CSS, JS, fonts) with Cache First strategy
 * - Cache HTML pages with Network First strategy
 * - Cache images with Stale While Revalidate strategy
 * - Active meal caching: Only cache live data for the currently cooking meal
 * - Recipe image caching for active meal
 *
 * The app sends SET_ACTIVE_MEAL when cooking starts, enabling targeted caching.
 */

const CACHE_NAME = "sunday-dinner-v2";
const MEAL_CACHE_NAME = "sunday-dinner-meal";

// Track active meal ID (persisted via IndexedDB in main thread)
let activeMealId = null;

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/live", // Live meal selection page
  // Note: Next.js generates hashed filenames for CSS/JS
  // These will be cached on first fetch instead of precache
];

// Cache strategies by request type
const CACHE_STRATEGIES = {
  static: "cache-first",
  document: "network-first",
  image: "stale-while-revalidate",
  api: "network-only",
  "active-meal": "network-first-then-cache", // Special strategy for active meal
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
            .filter(
              (name) => name !== CACHE_NAME && name !== MEAL_CACHE_NAME
            )
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

  // Skip cross-origin requests (except Supabase storage)
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes("supabase")) {
      // Cache Supabase storage images (recipe photos)
      event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
      return;
    }
    return;
  }

  // Determine strategy based on request type
  const strategy = getStrategy(request, url);

  switch (strategy) {
    case "cache-first":
      event.respondWith(cacheFirst(request, CACHE_NAME));
      break;
    case "network-first":
      event.respondWith(networkFirst(request, CACHE_NAME));
      break;
    case "stale-while-revalidate":
      event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
      break;
    case "active-meal":
      event.respondWith(activeMealStrategy(request, url));
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

  // Live meal page - use active meal strategy
  if (pathname.startsWith("/live/") && pathname.split("/").length === 3) {
    return "active-meal";
  }

  // Live API for active meal - use active meal strategy
  if (pathname.startsWith("/api/live/")) {
    const mealIdMatch = pathname.match(/\/api\/live\/([^/]+)/);
    if (mealIdMatch && mealIdMatch[1] === activeMealId) {
      return "active-meal";
    }
    // Other meal's live API - network only
    return CACHE_STRATEGIES.api;
  }

  // Other API routes - never cache
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
  if (
    destination === "document" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    return CACHE_STRATEGIES.document;
  }

  // Default to network only
  return CACHE_STRATEGIES.api;
}

/**
 * Cache First: Return cached response, fetch only if not cached
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match("/") || new Response("Offline", { status: 503 });
  }
}

/**
 * Network First: Try network, fall back to cache
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match("/") || new Response("Offline", { status: 503 });
  }
}

/**
 * Stale While Revalidate: Return cache immediately, update in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise || new Response("Offline", { status: 503 });
}

/**
 * Active Meal Strategy: Cache only for the current cooking meal
 *
 * Network first with fallback to meal-specific cache.
 * Only caches if the request is for the active meal.
 */
async function activeMealStrategy(request, url) {
  const pathname = url.pathname;

  // Extract meal ID from path
  let requestMealId = null;

  if (pathname.startsWith("/live/")) {
    requestMealId = pathname.split("/")[2];
  } else if (pathname.startsWith("/api/live/")) {
    requestMealId = pathname.split("/")[3];
  }

  // If this is for the active meal, use meal cache
  const isActiveMeal = requestMealId && requestMealId === activeMealId;
  const cacheName = isActiveMeal ? MEAL_CACHE_NAME : CACHE_NAME;

  try {
    const response = await fetch(request);

    if (response.ok && isActiveMeal) {
      // Cache active meal data
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Offline - try to serve from cache
    const cached = await caches.match(request);
    if (cached) {
      // Add header to indicate this is cached data
      const headers = new Headers(cached.headers);
      headers.set("X-SW-Cache", "true");
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      });
    }

    // For HTML pages, return the app shell
    if (
      request.headers.get("accept")?.includes("text/html") ||
      request.destination === "document"
    ) {
      return caches.match("/") || new Response("Offline", { status: 503 });
    }

    // For API calls, return offline error
    return new Response(
      JSON.stringify({ error: "Offline", offline: true }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Precache resources for a meal (called when cooking starts)
 */
async function precacheMeal(mealId, resources) {
  const cache = await caches.open(MEAL_CACHE_NAME);

  // Cache provided resources
  for (const url of resources) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn(`Failed to precache ${url}:`, error);
    }
  }
}

/**
 * Clear meal cache (called when cooking ends)
 */
async function clearMealCache() {
  await caches.delete(MEAL_CACHE_NAME);
}

/**
 * Message handler for cache control from the app
 */
self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CLEAR_CACHE":
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;

    case "SET_ACTIVE_MEAL":
      // Set the active meal for targeted caching
      const previousMealId = activeMealId;
      activeMealId = payload?.mealId || null;

      // Clear previous meal cache if switching meals
      if (previousMealId && previousMealId !== activeMealId) {
        clearMealCache();
      }

      // Precache resources if provided
      if (payload?.mealId && payload?.precacheUrls) {
        precacheMeal(payload.mealId, payload.precacheUrls);
      }

      event.ports[0]?.postMessage({
        success: true,
        activeMealId,
      });
      break;

    case "CLEAR_ACTIVE_MEAL":
      activeMealId = null;
      clearMealCache().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;

    case "GET_ACTIVE_MEAL":
      event.ports[0]?.postMessage({ activeMealId });
      break;

    case "PRECACHE_IMAGES":
      // Cache specific images (recipe photos)
      if (payload?.urls) {
        Promise.all(
          payload.urls.map(async (url) => {
            try {
              const response = await fetch(url);
              if (response.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(url, response);
              }
            } catch (e) {
              // Ignore precache failures
            }
          })
        ).then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
      }
      break;

    default:
      // Unknown message type
      break;
  }
});

/**
 * Background sync for offline queue (if supported)
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-queue") {
    event.waitUntil(
      // Notify all clients to trigger sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "TRIGGER_SYNC" });
        });
      })
    );
  }
});

/**
 * AbortSignal.timeout() polyfill for older browsers.
 *
 * AbortSignal.timeout() is an ES2024 feature that requires:
 * - Chrome 103+
 * - Safari 16.4+ (iOS Safari 16.4+)
 * - Firefox 100+
 *
 * This polyfill provides a fallback for older iOS Safari versions.
 */

/**
 * Creates an AbortSignal that will abort after the specified timeout.
 *
 * Uses native AbortSignal.timeout() when available, falls back to
 * manual AbortController + setTimeout for older browsers.
 *
 * @param ms - Timeout in milliseconds
 * @returns AbortSignal that will abort after the timeout
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/data', {
 *   signal: createTimeoutSignal(5000),
 * });
 * ```
 */
export function createTimeoutSignal(ms: number): AbortSignal {
  // Use native AbortSignal.timeout if available (iOS 16.4+, modern browsers)
  if ("timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }

  // Fallback for older iOS Safari and other browsers
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

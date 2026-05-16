/* ═══════════════════════════════════════════════════
   ITUNES SEARCH PROVIDER
   Uses JSONP via the `callback` param so it works in
   every browser (mobile Safari has strict CORS).
   Docs: https://performance-partners.apple.com/search-api
═══════════════════════════════════════════════════ */

const ENDPOINT = 'https://itunes.apple.com/search';

let cbCounter = 0;

/**
 * JSONP fetch — injects a <script> tag and resolves with the parsed payload.
 * Honors AbortSignal by removing the callback and script.
 */
function jsonp(url, { signal, timeout = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
      return;
    }

    const cbName = `__rewind_itunes_cb_${Date.now()}_${cbCounter++}`;
    const sep = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${sep}callback=${cbName}`;

    const script = document.createElement('script');

    let timer;
    let settled = false;

    const cleanup = () => {
      setTimeout(() => {
        try {
          delete window[cbName];
        } catch {}

        script.remove();
        clearTimeout(timer);

        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
      }, 0);
    };

    const finish = (fn) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onAbort = () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';

      finish(() => reject(err));
    };

    window[cbName] = (data) => {
      finish(() => resolve(data));
    };

    script.onerror = () => {
      finish(() => reject(
        new Error('JSONP request failed')
      ));
    };

    timer = setTimeout(() => {
      finish(() => reject(
        new Error('JSONP request timed out')
      ));
    }, timeout);

    if (signal) {
      signal.addEventListener('abort', onAbort);
    }

    script.async = true;
    script.src = fullUrl;

    document.head.appendChild(script);
  });
}
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

    const cleanup = () => {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
    };

    window[cbName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timed out'));
    }, timeout);

    if (signal) signal.addEventListener('abort', onAbort);

    script.src = fullUrl;
    document.head.appendChild(script);
  });
}

/** @type {import('./provider.js').SearchProvider} */
export const itunesProvider = {
  id: 'itunes',

  async search(query, { signal, limit = 8 } = {}) {
    const q = query.trim();
    if (!q) return [];

    const url = new URL(ENDPOINT);
    url.searchParams.set('term', q);
    url.searchParams.set('entity', 'song');
    url.searchParams.set('media', 'music');
    url.searchParams.set('limit', String(limit));

    const data = await jsonp(url.toString(), { signal });

    return (data.results || []).map(r => ({
      id: String(r.trackId),
      title: r.trackName || '',
      artist: r.artistName || '',
      album: r.collectionName || '',
      artworkUrl: (r.artworkUrl100 || '').replace('100x100', '300x300'),
      previewUrl: r.previewUrl || '',
      url: r.trackViewUrl || '',
      provider: 'itunes',
    })).filter(t => t.title && t.url);
  },
};

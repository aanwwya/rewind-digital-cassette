/* ═══════════════════════════════════════════════════
   ITUNES SEARCH PROVIDER
   Free, no auth, CORS-friendly.
   Docs: https://performance-partners.apple.com/search-api
═══════════════════════════════════════════════════ */

const ENDPOINT = 'https://itunes.apple.com/search';

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

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
    const data = await res.json();

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

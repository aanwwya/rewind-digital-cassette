/* ═══════════════════════════════════════════════════
   SEARCH PROVIDER — contract
═══════════════════════════════════════════════════ */

/**
 * @typedef {Object} Track
 * @property {string} id          - provider-unique id
 * @property {string} title       - song title
 * @property {string} artist      - artist name
 * @property {string} [album]     - album / collection name
 * @property {string} [artworkUrl]- album art URL
 * @property {string} [previewUrl]- 30s audio preview URL
 * @property {string} url         - public web link to the song
 * @property {string} provider    - provider id (e.g. 'itunes')
 */

/**
 * @typedef {Object} SearchProvider
 * @property {string} id
 * @property {(query: string, opts?: { signal?: AbortSignal, limit?: number }) => Promise<Track[]>} search
 */

export {};

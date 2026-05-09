/* ═══════════════════════════════════════════════════
   DOM — central element references
   (lazy getters so DOM is ready when accessed)
═══════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

export const dom = {
  // Form
  get songInput()      { return $('songInput'); },
  get artistInput()    { return $('artistInput'); },
  get msgInput()       { return $('msgInput'); },
  get fromInput()      { return $('fromInput'); },
  get themeSelector()  { return $('themeSelector'); },
  get charCount()      { return $('charCount'); },
  get formError()      { return $('formError'); },
  get songResults()    { return $('songResults'); },

  // Player
  get playBtn()        { return $('playBtn'); },
  get progressBar()    { return $('progressBar'); },
  get currentTime()    { return $('currentTime'); },
  get reelLeft()       { return $('reelLeft'); },
  get reelRight()      { return $('reelRight'); },
  get vinylDisc()      { return $('vinylDisc'); },
  get messageCard()    { return $('messageCard'); },
  get nowPlaying()     { return document.querySelector('.now-playing'); },
  get cassetteEl()     { return $('cassetteEl'); },
  get vinylEl()        { return $('vinylEl'); },
  get songLink()       { return $('songLink'); },
  get tapeWrapper()    { return $('tapeWrapper'); },
  get playerBackBtn()  { return $('playerBackBtn'); },

  // Misc
  get toast()              { return $('toast'); },
  get sparklesContainer()  { return $('sparklesContainer'); },
  get suggestionsBox()     { return $('suggestionsBox'); },
};

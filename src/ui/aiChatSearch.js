/**
 * In-conversation find for the AI Command Center transcript.
 *
 * Extracted from the command center so the search state (the match list and the
 * active index) has one owner instead of two closure variables that every
 * caller had to remember to reset. The controller is created lazily by the
 * panel, because a controller built at module scope would capture a DOM tree
 * that does not exist yet.
 *
 * The panel's tests drive this against stub elements, so every DOM call is
 * optional-chained or guarded by a typeof check rather than assumed present.
 */
export function createChatSearch({
  panel,
  messagesContainer,
  searchBar,
  searchInput,
  searchCount,
  searchToggleBtn,
  searchCloseBtn,
  onDismiss,
}) {
  /** @type {{ el: Element, text: string }[]} */
  let searchMatches = [];
  let currentMatchIndex = -1;

  function updateSearchHighlights() {
    if (typeof panel.querySelectorAll === 'function') {
      panel.querySelectorAll('.ai-msg.ai-search-match').forEach((el) => {
        el.classList?.remove?.('ai-search-match', 'ai-search-active-match');
      });
    }

    if (searchMatches.length === 0) {
      if (searchCount) searchCount.textContent = '0/0';
      return;
    }

    if (currentMatchIndex < 0) currentMatchIndex = 0;
    if (currentMatchIndex >= searchMatches.length)
      currentMatchIndex = searchMatches.length - 1;

    searchMatches.forEach((match, idx) => {
      match.el.classList?.add?.('ai-search-match');
      if (idx === currentMatchIndex) {
        match.el.classList?.add?.('ai-search-active-match');
        if (typeof match.el.scrollIntoView === 'function') {
          match.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    if (searchCount) {
      searchCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length}`;
    }
  }

  function performChatSearch(query) {
    const q = (query || '').toLowerCase().trim();
    searchMatches = [];
    currentMatchIndex = -1;

    if (!q || !messagesContainer) {
      updateSearchHighlights();
      return;
    }

    const allMsgEls =
      typeof messagesContainer.querySelectorAll === 'function'
        ? Array.from(messagesContainer.querySelectorAll('.ai-msg'))
        : [];
    allMsgEls.forEach((el) => {
      const text = (
        el.querySelector?.('.ai-msg-content')?.textContent ||
        el.textContent ||
        ''
      ).toLowerCase();
      if (text.includes(q)) {
        searchMatches.push({ el, text });
      }
    });

    if (searchMatches.length > 0) {
      currentMatchIndex = 0;
    }
    updateSearchHighlights();
  }

  function toggleChatSearch(forceState = null) {
    if (!searchBar) return;
    const willOpen = forceState !== null ? forceState : searchBar.hidden;
    searchBar.hidden = !willOpen;
    searchToggleBtn?.classList.toggle('active', willOpen);
    if (willOpen) {
      if (searchInput) {
        searchInput.focus?.();
        searchInput.select?.();
        performChatSearch(searchInput.value);
      }
    } else {
      searchMatches = [];
      updateSearchHighlights();
      onDismiss?.();
    }
  }

  function step(delta) {
    if (searchMatches.length === 0) return;
    currentMatchIndex =
      (currentMatchIndex + delta + searchMatches.length) % searchMatches.length;
    updateSearchHighlights();
  }

  searchToggleBtn?.addEventListener('click', () => toggleChatSearch());
  searchCloseBtn?.addEventListener('click', () => toggleChatSearch(false));
  searchInput?.addEventListener('input', () => {
    performChatSearch(searchInput.value);
  });
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault?.();
      step(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Escape') {
      event.preventDefault?.();
      toggleChatSearch(false);
    }
  });

  return {
    performChatSearch,
    toggleChatSearch,
    updateSearchHighlights,
    get matchCount() {
      return searchMatches.length;
    },
    get activeMatchIndex() {
      return currentMatchIndex;
    },
  };
}

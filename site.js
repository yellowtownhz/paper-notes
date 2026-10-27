/* Search and reading position are stored only in this browser. */
(function () {
    'use strict';
    const search = document.getElementById('note-search');
    const siteBase = new URL('.', document.querySelector('.home-btn')?.href || location.href);
    const storagePrefix = 'paper-notes:' + siteBase.pathname;
    function read(key) {
        try { return JSON.parse(localStorage.getItem(storagePrefix + key)); } catch (_) { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(storagePrefix + key, JSON.stringify(value)); } catch (_) {}
    }
    if (search) {
        const cards = Array.from(document.querySelectorAll('.paper-card'));
        const status = document.getElementById('search-status');
        function filter() {
            const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
            let visible = 0;
            let total = 0;
            cards.forEach(card => {
                const text = (card.textContent + ' ' + decodeURIComponent(new URL(card.href).pathname)).toLocaleLowerCase();
                card.hidden = !terms.every(term => text.includes(term));
                if (card.closest('.tab-panel')?.classList.contains('active')) {
                    total++;
                    if (!card.hidden) visible++;
                }
            });
            status.textContent = terms.length ? `当前分类找到 ${visible} 条结果` : `当前分类共 ${total} 条`;
        }
        search.addEventListener('input', filter);
        document.querySelectorAll('.tab-btn').forEach(button => button.addEventListener('click', filter));
        filter();
        const last = read('last');
        if (last && typeof last.href === 'string') {
            const target = new URL(last.href, siteBase);
            const published = ['01_Research/Reading/', '03_Personal/MOCs/'];
            if (target.origin === location.origin && published.some(path => target.pathname.startsWith(siteBase.pathname + path))) {
                const link = document.createElement('a');
                link.className = 'resume-reading';
                link.href = target.href;
                link.textContent = '继续阅读：' + last.title;
                search.parentElement.before(link);
            }
        }
        return;
    }
    if (!document.querySelector('.main-content')) return;
    const title = document.querySelector('h1')?.textContent || document.title;
    const key = 'position:' + location.pathname;
    const saved = read(key);
    write('last', { href: location.href.split('#')[0], title });
    // Let images and math settle before restoring a previous position.
    function restore() {
        if (!location.hash && saved && Number.isFinite(saved.y)) {
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, saved.y);
            document.documentElement.style.scrollBehavior = '';
        }
    }
    if (document.readyState === 'complete') restore();
    else window.addEventListener('load', restore, { once: true });
    const save = () => write(key, { y: window.scrollY });
    let timer;
    window.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(save, 250); }, { passive: true });
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
})();

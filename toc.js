(function () {
    var container = document.querySelector('.container');
    if (!container) return;

    var headings = container.querySelectorAll('.section h2, .section h3');
    if (headings.length < 3) return;

    // Filter headings
    var items = [];
    headings.forEach(function (h, i) {
        var text = h.textContent.trim();
        if (/qu[eé]t m[aã]/i.test(text)) return;
        var id = 'toc-' + i;
        h.setAttribute('id', id);
        items.push({ id: id, text: text, level: h.tagName });
    });
    if (items.length < 3) return;

    var isSidebar = false;

    // === Toggle button (bottom-right) ===
    var btn = document.createElement('button');
    btn.className = 'toc-toggle';
    btn.setAttribute('aria-label', 'Mục lục');
    btn.innerHTML = '&#9776;';
    document.body.appendChild(btn);

    // === Panel ===
    var panel = document.createElement('div');
    panel.className = 'toc-panel';

    // Header
    var header = document.createElement('div');
    header.className = 'toc-header';
    header.innerHTML =
        '<span>Mục lục</span>' +
        '<button class="toc-close" aria-label="Đóng">&times;</button>';
    panel.appendChild(header);

    var closeBtn = header.querySelector('.toc-close');

    // Body
    var tocBody = document.createElement('div');
    tocBody.className = 'toc-body';

    items.forEach(function (item) {
        var a = document.createElement('a');
        a.href = '#' + item.id;
        a.textContent = item.text;
        if (item.level === 'H3') a.className = 'toc-h3';

        a.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(item.id);
            if (target) {
                var navH = document.querySelector('.nav');
                var offset = navH ? navH.offsetHeight + 10 : 50;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
            // Close popup on mobile (not sidebar mode)
            if (!isSidebar && window.innerWidth < 768) {
                closePanel();
            }
        });
        tocBody.appendChild(a);
    });

    panel.appendChild(tocBody);
    document.body.appendChild(panel);

    // === Sidebar overlay (mobile) ===
    var overlay = document.createElement('div');
    overlay.className = 'toc-overlay';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function () {
        if (isSidebar && window.innerWidth < 768) {
            collapseSidebar();
        }
    });

    // === Open / Close popup ===
    function openPanel() {
        panel.classList.add('open');
        btn.classList.add('active');
    }

    function closePanel() {
        panel.classList.remove('open');
        btn.classList.remove('active');
    }

    btn.addEventListener('click', function () {
        if (isSidebar) {
            // Toggle sidebar visibility on mobile
            if (window.innerWidth < 768) {
                document.body.classList.toggle('toc-sidebar-mobile-open');
                overlay.classList.toggle('visible');
            } else {
                collapseSidebar();
            }
            return;
        }
        // Popup open → expand to sidebar; Closed → open popup
        if (panel.classList.contains('open')) {
            closePanel();
            expandSidebar();
        } else {
            openPanel();
        }
    });

    closeBtn.addEventListener('click', function () {
        if (isSidebar) {
            collapseSidebar();
        } else {
            closePanel();
        }
    });

    // === Sidebar mode ===
    function expandSidebar() {
        isSidebar = true;
        closePanel();
        document.body.classList.add('toc-sidebar-active');
        panel.classList.add('toc-sidebar');
        btn.classList.add('active');

        if (window.innerWidth < 768) {
            document.body.classList.add('toc-sidebar-mobile-open');
            overlay.classList.add('visible');
        }
    }

    function collapseSidebar() {
        isSidebar = false;
        document.body.classList.remove('toc-sidebar-active');
        document.body.classList.remove('toc-sidebar-mobile-open');
        panel.classList.remove('toc-sidebar');
        overlay.classList.remove('visible');
        btn.classList.remove('active');
    }

    // === Highlight on scroll ===
    var links = tocBody.querySelectorAll('a');
    var ticking = false;

    function updateActive() {
        var navH = document.querySelector('.nav');
        var offset = (navH ? navH.offsetHeight : 50) + 20;
        var current = null;

        items.forEach(function (item, i) {
            var el = document.getElementById(item.id);
            if (el) {
                var rect = el.getBoundingClientRect();
                if (rect.top <= offset + 5) current = i;
            }
        });

        links.forEach(function (a, i) {
            a.classList.toggle('toc-active', i === current);
        });

        if (current !== null && links[current]) {
            var activeLink = links[current];
            var bRect = tocBody.getBoundingClientRect();
            var lRect = activeLink.getBoundingClientRect();
            if (lRect.top < bRect.top || lRect.bottom > bRect.bottom) {
                activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateActive);
            ticking = true;
        }
    }, { passive: true });

    updateActive();

    // === Handle resize: if in sidebar mode and screen changes ===
    window.addEventListener('resize', function () {
        if (isSidebar) {
            if (window.innerWidth >= 768) {
                document.body.classList.remove('toc-sidebar-mobile-open');
                overlay.classList.remove('visible');
            }
        }
    });
})();

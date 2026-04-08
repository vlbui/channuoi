(function () {
    // Only run on pages with .container (not index)
    var container = document.querySelector('.container');
    if (!container) return;

    // Collect h2 and h3 inside .section (skip QR section)
    var headings = container.querySelectorAll('.section h2, .section h3');
    if (headings.length < 3) return; // skip pages with too few headings

    // Filter out QR/non-content headings
    var items = [];
    headings.forEach(function (h, i) {
        var text = h.textContent.trim();
        if (/qu[eé]t m[aã]/i.test(text)) return; // skip QR section heading
        var id = 'toc-' + i;
        h.setAttribute('id', id);
        items.push({ id: id, text: text, level: h.tagName });
    });

    if (items.length < 3) return;

    // Create toggle button
    var btn = document.createElement('button');
    btn.className = 'toc-toggle';
    btn.setAttribute('aria-label', 'Mục lục');
    btn.innerHTML = '&#9776;';
    document.body.appendChild(btn);

    // Create panel
    var panel = document.createElement('div');
    panel.className = 'toc-panel';

    var header = document.createElement('div');
    header.className = 'toc-header';
    header.innerHTML = '<span>Mục lục</span><button class="toc-close" aria-label="Đóng">&times;</button>';
    panel.appendChild(header);

    var body = document.createElement('div');
    body.className = 'toc-body';

    items.forEach(function (item) {
        var a = document.createElement('a');
        a.href = '#' + item.id;
        a.textContent = item.text;
        if (item.level === 'H3') {
            a.className = 'toc-h3';
        }
        a.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(item.id);
            if (target) {
                var navH = document.querySelector('.nav');
                var offset = navH ? navH.offsetHeight + 10 : 50;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
            // Close panel on mobile
            if (window.innerWidth < 600) {
                panel.classList.remove('open');
                btn.classList.remove('active');
            }
        });
        body.appendChild(a);
    });

    panel.appendChild(body);
    document.body.appendChild(panel);

    // Toggle
    btn.addEventListener('click', function () {
        var isOpen = panel.classList.toggle('open');
        btn.classList.toggle('active', isOpen);
    });

    // Close button
    header.querySelector('.toc-close').addEventListener('click', function () {
        panel.classList.remove('open');
        btn.classList.remove('active');
    });

    // Highlight active heading on scroll
    var links = body.querySelectorAll('a');
    var ticking = false;

    function updateActive() {
        var navH = document.querySelector('.nav');
        var offset = (navH ? navH.offsetHeight : 50) + 20;
        var current = null;

        items.forEach(function (item, i) {
            var el = document.getElementById(item.id);
            if (el) {
                var rect = el.getBoundingClientRect();
                if (rect.top <= offset + 5) {
                    current = i;
                }
            }
        });

        links.forEach(function (a, i) {
            a.classList.toggle('toc-active', i === current);
        });

        // Auto-scroll TOC to active item
        if (current !== null && links[current]) {
            var activeLink = links[current];
            var bodyRect = body.getBoundingClientRect();
            var linkRect = activeLink.getBoundingClientRect();
            if (linkRect.top < bodyRect.top || linkRect.bottom > bodyRect.bottom) {
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

    // Initial highlight
    updateActive();
})();

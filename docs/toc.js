// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="index.html">About Nutils</a></li><li class="chapter-item expanded "><a href="intro.html"><strong aria-hidden="true">1.</strong> How to Read This Book</a></li><li class="chapter-item expanded "><a href="start.html"><strong aria-hidden="true">2.</strong> Getting Started</a></li><li class="chapter-item expanded "><a href="install.html"><strong aria-hidden="true">3.</strong> Installation</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="install-nutils.html"><strong aria-hidden="true">3.1.</strong> Installing Nutils</a></li><li class="chapter-item expanded "><a href="install-matrix.html"><strong aria-hidden="true">3.2.</strong> Installing a Matrix Backend</a></li><li class="chapter-item expanded "><a href="install-quality.html"><strong aria-hidden="true">3.3.</strong> Quality of Life</a></li><li class="chapter-item expanded "><a href="install-performance.html"><strong aria-hidden="true">3.4.</strong> Improving Performance</a></li><li class="chapter-item expanded "><a href="install-containers.html"><strong aria-hidden="true">3.5.</strong> Using Containers</a></li><li class="chapter-item expanded "><a href="install-remote.html"><strong aria-hidden="true">3.6.</strong> Remote Computing</a></li></ol></li><li class="chapter-item expanded "><a href="tutorial.html"><strong aria-hidden="true">4.</strong> Tutorial</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="tutorial-theory.html"><strong aria-hidden="true">4.1.</strong> A Little Bit of Theory</a></li><li class="chapter-item expanded "><a href="tutorial-topovgeom.html"><strong aria-hidden="true">4.2.</strong> Topology vs Geometry</a></li><li class="chapter-item expanded "><a href="tutorial-bases.html"><strong aria-hidden="true">4.3.</strong> Bases</a></li><li class="chapter-item expanded "><a href="tutorial-functions.html"><strong aria-hidden="true">4.4.</strong> Functions</a></li><li class="chapter-item expanded "><a href="tutorial-namespace.html"><strong aria-hidden="true">4.5.</strong> Namespace</a></li><li class="chapter-item expanded "><a href="tutorial-integrals.html"><strong aria-hidden="true">4.6.</strong> Integrals</a></li><li class="chapter-item expanded "><a href="tutorial-solvers.html"><strong aria-hidden="true">4.7.</strong> Solvers</a></li><li class="chapter-item expanded "><a href="tutorial-sampling.html"><strong aria-hidden="true">4.8.</strong> Sampling</a></li><li class="chapter-item expanded "><a href="tutorial-laplace2d.html"><strong aria-hidden="true">4.9.</strong> 2D Laplace Problem</a></li></ol></li><li class="chapter-item expanded "><a href="release.html"><strong aria-hidden="true">5.</strong> Release History</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="release-9.html"><strong aria-hidden="true">5.1.</strong> Nutils 9 Jook-Sing</a></li><li class="chapter-item expanded "><a href="release-8.html"><strong aria-hidden="true">5.2.</strong> Nutils 8 Idiyappam</a></li><li class="chapter-item expanded "><a href="release-7.html"><strong aria-hidden="true">5.3.</strong> Nutils 7 Hiyamugi</a></li><li class="chapter-item expanded "><a href="release-6.html"><strong aria-hidden="true">5.4.</strong> Nutils 6 Garak-Guksu</a></li><li class="chapter-item expanded "><a href="release-5.html"><strong aria-hidden="true">5.5.</strong> Nutils 5 Farfalle</a></li><li class="chapter-item expanded "><a href="release-4.html"><strong aria-hidden="true">5.6.</strong> Nutils 4 Eliche</a></li><li class="chapter-item expanded "><a href="release-3.html"><strong aria-hidden="true">5.7.</strong> Nutils 3 Dragon Beard</a></li><li class="chapter-item expanded "><a href="release-2.html"><strong aria-hidden="true">5.8.</strong> Nutils 2 Chuka Men</a></li><li class="chapter-item expanded "><a href="release-1.html"><strong aria-hidden="true">5.9.</strong> Nutils 1 Bakmi</a></li><li class="chapter-item expanded "><a href="release-0.html"><strong aria-hidden="true">5.10.</strong> Nutils 0 Anelli</a></li></ol></li><li class="chapter-item expanded "><a href="examples.html"><strong aria-hidden="true">6.</strong> Examples</a></li><li class="chapter-item expanded "><a href="science.html"><strong aria-hidden="true">7.</strong> Science</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="science-publications.html"><strong aria-hidden="true">7.1.</strong> Publications</a></li><li class="chapter-item expanded "><a href="science-citing.html"><strong aria-hidden="true">7.2.</strong> Citing Nutils</a></li></ol></li><li class="chapter-item expanded "><a href="support.html"><strong aria-hidden="true">8.</strong> Support</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);

/** @summary: Infinite scroller that uses progressive enhancement.
    @example: <div id="pageBodyId"><a href="nextPage.html" include-on-proximity>Next Page</a></div>
    //This will inline nextPage.html when user scrolls down to the link. The link
    //needs to reside insite an element with ID that has a corresponding element
    //on the next page.
    @description: include-on-proximity="x" will start loading the next page when the
    viewport is x pixels away from the link. Defaults to 100 pixels. */
(function includeOnProximityIIFE() { /*globals $registerBehavior*/
    'use strict';

    ({
        name: 'include-on-proximity',
        pollRate: 100, //ms
        defaultProximity: 100, //px
        window: window, //for unit testing
        document: document, //for unit testing

        init: function init() {
            if (typeof $registerBehavior === 'function') {
                $registerBehavior(this); //for testing and other clever things
            }
            this.keepTicking();
        },

        keepTicking: function keepTicking() {
            this.checkForChanges();
            setTimeout(keepTicking.bind(this), this.pollRate);
        },

        checkForChanges: function checkForChanges() {
            Array.prototype.slice.call(
                this.document.querySelectorAll('[' + this.name + ']')
            )
            .filter(this.isCloseToVisibility, this)
            .forEach(this.includeLink, this);
        },

        getProximity: function getProximity(link) {
            var proximity = parseInt(link.getAttribute(this.name));
            return isNaN(proximity) ? this.defaultProximity : proximity;
        },

        isCloseToVisibility: function isCloseToVisibility(link) {
            var proximity = this.getProximity(link),
                elementEdges = this.getNodeEdges(link),
                viewportTop = this.window.pageYOffset,
                viewportBottom = this.window.pageYOffset + this.window.innerHeight,
                adjustedTopEdge = elementEdges.top - proximity,
                adjustedBottomEdge = elementEdges.bottom + proximity;

            return adjustedTopEdge >= viewportTop && adjustedTopEdge <= viewportBottom ||
                adjustedBottomEdge >= viewportTop && adjustedBottomEdge <= viewportBottom;
        },

        includeLink: function includeLink(link) {
            var url = link.getAttribute('href');
            link.setAttribute(this.name + '-loading', ''); //for styling
            link.removeAttribute(this.name); //we will try page inlining only once

            this.loadPage('GET', url, function then(responseText) {
                var responsePage = this.document.createElement('buffer'), //'this' is bound to the object (see below)
                    elementFromNextPage;

                responsePage.innerHTML = responseText; //effectively, parses response
                elementFromNextPage = responsePage.querySelector('#' + link.parentElement.id);

                link.parentElement.replaceChild(elementFromNextPage, link);
            }.bind(this));
        },

        getNodeEdges: function getNodeEdges(node) {
            var top = 0,
                height = node.offsetHeight;
            while (node) { //to take all offsets into account
                if (node.tagName) {
                    top = top + node.offsetTop;
                    node = node.offsetParent;
                } else {
                    node = node.parentNode;
                }
            }
            return {
                top: top,
                bottom: top + height
            };
        },

        loadPage: function loadPage(method, url, finished) {
            var request = new XMLHttpRequest();
            request.onload = function processResponse() {
                if (request.status !== 200 && request.status !== 304) {
                    return;
                }
                finished(request.responseText);
            };
            request.open(method, url, true);
            request.send();
        }
    }).init();

}());

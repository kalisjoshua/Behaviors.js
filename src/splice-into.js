/** @summary: Declarative AJAX for HTML forms.
    @example: <form action="/whatever/page" splice-into="#placeholder">...</form> <div id="placeholder"></div>
    // When the above form is submitted, this library will load /whatever/page in the background and replace div
    // 'placeholder' with whatever has the same id on /whatever/page.
    @description: Works on multiple targets if the selector matches multiple elements. */
(function spliceIntoIIFE() { /*globals $registerBehavior*/
    'use strict';

    function toArray(x) { //aliasing for clarity and compactness
        return Array.prototype.slice.call(x);
    }

    var name = 'splice-into'; //for reuse in object literal

    ({
        name: name,
        registered: name + '-registered',
        selector: 'form[' + name + ']:not([' + name + '-registered])',
        loading: name + '-loading',
        loaded: name + '-loaded',
        disabledMarker: name + '-disabled',
        pollRate: 100, //ms

        submittingButton: null,
        document: document, //for unit testing

        init: function init() {
            if (typeof $registerBehavior === 'function') {
                $registerBehavior(this); //for testing and other clever things
            }
            this.keepTicking();
        },

        keepTicking: function keepTicking() { //permanently bound to the module in init()
            this.scanForms();
            setTimeout(this.keepTicking.bind(this), this.pollRate);
        },

        scanForms: function scanForms() {
            toArray(this.document.querySelectorAll(this.selector))
                .forEach(this.trackForm, this);
        },

        trackForm: function trackForm(form) {
            this.trackLastClickedButton(form);
            form.addEventListener('submit', this.processFormSubmit.bind(this));
            form.setAttribute(this.registered, '');
        },

        trackLastClickedButton: function trackLastClickedButton(form) { //because clicked button's value gets added to query
            var self = this;

            function addButtonListener(button) {
                button.addEventListener('click', function buttonListened(event) {
                    self.submittingButton = event.target;
                });
            }

            toArray(form.querySelectorAll('button[type=submit]'))
                .forEach(addButtonListener);
        },

        pageLoadHandler: function pageLoadHandler(targets, responseText) {
            var nextPage = this.parsePage(responseText);
            targets.forEach(this.replaceWithTwin.bind(this, nextPage));
        },

        getTargetElements: function getTargetElements(form) {
            var selector = form.getAttribute(this.name);
            return toArray(this.document.querySelectorAll(selector));
        },

        processFormSubmit: function processFormSubmit(event) {
            if (!!this.submittingButton && this.submittingButton.hasAttribute(this.disabledMarker)) {
                return; //normal form submit with no AJAX
            }
            event.preventDefault();
            this.splice(event.target);
        },

        splice: function splice(form) {
            var queryString = this.serializeForm(form),
                url = this.composeURL(form.action, queryString),
                targets = this.getTargetElements(form),
                processPage = this.pageLoadHandler.bind(this, targets);

            targets.forEach(function setLoading(target) {
                target.setAttribute(this.loading, true);
            }, this);

            this.loadPage(form.method, url, processPage);
        },

        fieldFilter: function fieldFilter(field) {
            if (field.type === 'checkbox') {
                return field.checked;
            } else if (field.tagName === 'BUTTON') {
                return field === this.submittingButton;
            }
            return true;
        },

        serializeForm: function serializeForm(form) {
            return toArray(form.elements)
                .filter(function hasName(field) {
                    return !!field.name;
                })
                .filter(this.fieldFilter, this)
                .map(function toString(e) {
                    return e.name + '=' + encodeURIComponent(e.value);
                })
                .join('&');
        },

        composeURL: function composeURL(url, queryString) {
            var urlElement = document.createElement('a');
            urlElement.href = url;
            urlElement.search = queryString.replace(/%20/g, '+'); //replace significantly shortens natural language GET URLs
            return urlElement.href;
        },

        replaceWithTwin: function replaceWithTwin(pageWithReplacement, targetElement) {
            var twinElement = pageWithReplacement.querySelector('#' + targetElement.id);
            targetElement.removeAttribute(this.loading); //for CSS

            if (!twinElement) { return; }

            twinElement.setAttribute(this.loaded, true); //for CSS fade-in effects
            targetElement.parentNode.replaceChild(twinElement, targetElement); //also would work, but probably less efficient: targetElement.outerHTML = twinElement.outerHTML;
        },

        parsePage: function parsePage(htmlString) {
            var responsePage = document.createElement('buffer'); //this will create a new document, the name does not matter
            responsePage.innerHTML = htmlString;
            return responsePage;
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

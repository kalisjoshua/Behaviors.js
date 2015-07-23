Behaviors.JS
============

JavaScript libraries are configured by adding tags and attributes to your HTML. Each one follows the principle of progressive enhancement and has no external dependencies.

Compatibility target: IE9+. Will fall back to default behavior on older browsers.

Examples
--------

###splice-into

Submits forms via AJAX and applies selected updates to the current page.

    <form action="/whatever/page" splice-into="#placeholder">
    <!-- ... -->
    </form>

    <div id="placeholder">
    <!-- this will be updated when you submit the form -->
    </div>

###characters-left

Counts characters remaining in a particular text field or area. Uses length from either max-length or data-val-length-max attributes on the target field.

    <textarea id="field-id"></textarea>
    <characters-left in="field-id" />

###include-on-proximity

Infinite scroller. Inlines target of a link when you scroll close to the said link.

    <div id="countainer-needs-id">
        <!-- page content... -->
        <a href="/page/2" include-on-proximity>Next Page</a>
    </div>

Infinite scroller. Inlines target of a link when you scroll close to the said link.

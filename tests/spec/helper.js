var behaviors = {};

function $registerBehavior(intercepted) {
    intercepted.tick = doNothing; //stop module from running on a timer
    behaviors[intercepted.name] = intercepted;
}

function doNothing() {}

function returnsZero() {
    return 0;
}

function make(html) {
    var newDocument = document.implementation.createHTMLDocument('title');
    newDocument.body.innerHTML = html;

    if (newDocument.body.children.length !== 1) {
        throw "make() must be invoked with code tha generates a single tag.";
    }
    return newDocument.body.children[0];
}

function makePage(html) {
    var newDocument = document.implementation.createHTMLDocument('title');
    newDocument.body.innerHTML = html;
    return newDocument;
}

describe('include-on-proximity ', function() { /*globals behaviors, makePage, make, doNothing, returnsZero*/
    'use strict';

    var module;

    beforeEach(function() {
        module = Object.create(behaviors['include-on-proximity']);
    });

    it('checks marked tags', function() {
        module.document = make(
            '<div>' +
                '<div id="yes" ' + module.name + '></div>' +
                '<div id="no"></div>' +
            '</div>'
        );
        module.isCloseToVisibility = function(e) {
            return e.id === 'yes';
        };
        module.includeLink = jasmine.createSpy('includeLinkFake');

        module.checkForChanges();

        var target = module.document.querySelector('#yes');
        expect(module.includeLink).toHaveBeenCalledWith(target, 0, jasmine.any(Array));
    });

    it('proximity is parsed', function() {
        var element = make('<a include-on-proximity="7"></a>');

        var proximity = module.getProximity(element);

        expect(proximity).toBe(7);
    });

    it('proximity get default if not specified', function() {
        var element = make('<a></a>');

        var proximity = module.getProximity(element);

        expect(proximity).toBe(module.defaultProximity);
    });

    it('does not trigger when element is below viewport', function() {
        module.getProximity = returnsZero;
        module.window = { pageYOffset: 20, innerHeight: 10 };
        module.getNodeEdges = function() {
            return { top: 31, bottom: 40 };
        };

        var result = module.isCloseToVisibility(null);

        expect(result).toBe(false);
    });

    it('triggers when entire element is visible', function() {
        module.getProximity = returnsZero;
        module.window = { pageYOffset: 20, innerHeight: 10 };
        module.getNodeEdges = function() {
            return { top: 21, bottom: 29 };
        };

        var result = module.isCloseToVisibility(null);

        expect(result).toBe(true);
    });

    it('triggers when element bottom edge is visible', function() {
        module.getProximity = returnsZero;
        module.window = { pageYOffset: 20, innerHeight: 10 };
        module.getNodeEdges = function() {
            return { top: 19, bottom: 20 };
        };

        var result = module.isCloseToVisibility(null);

        expect(result).toBeTruthy();
    });

    it('triggers when element top edge is visible', function() {
        module.getProximity = returnsZero;
        module.window = { pageYOffset: 20, innerHeight: 30 };
        module.getNodeEdges = function() {
            return { top: 30, bottom: 31 };
        };

        var result = module.isCloseToVisibility(null);

        expect(result).toBeTruthy();
    });

    it('should substitutes tags', function() {
        var currentPage = make('<div id="container"><a href="page">next</a></div>');
        var link = currentPage.querySelector('a');

        var nextPageText = '<div id="container"><span id="target">new</span></div>';
        module.loadPage = function loadPageStab(a, b, callback) {
            callback(nextPageText);
        };

        module.includeLink(link);

        var target = currentPage.querySelector('#container > #target');
        expect(target.innerHTML).toEqual('new');
    });

    it('should set loading and remove marker attributes', function() {
        var link = make('<a href="" include-on-proximity>next</a>');
        module.loadPage = doNothing;

        module.includeLink(link);

        expect(link.hasAttribute('include-on-proximity')).toBe(false);
        expect(link.hasAttribute('include-on-proximity-loading')).toBe(true);
    });

    it('should look at partent', function() {
        var fakeNode = {
            offsetTop: 10,
            offsetHeight: 5,
            tagName: 'defined',

            offsetParent: {
                offsetTop: 7,
                tagName: 'defined'
            }
        };
        var result = module.getNodeEdges(fakeNode);
        expect(result.top).toEqual(17);
        expect(result.bottom).toEqual(22);
    });

    it('should skip nameless nodes', function() {
        var fakeNode = {
            offsetTop: 10,
            offsetHeight: 5,
            tagName: 'defined',

            offsetParent: {
                offsetTop: 7,
                tagName: undefined,

                parentNode: {
                    tagName: 'defined',
                    offsetTop: 1,
                }
            }
        };

        var result = module.getNodeEdges(fakeNode);

        expect(result.top).toEqual(11);
        expect(result.bottom).toEqual(16);
    });
});

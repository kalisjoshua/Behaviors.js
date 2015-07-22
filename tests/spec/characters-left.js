describe('characters-left ', function() { /*globals behaviors, makePage*/
    'use strict';

    var module;

    beforeEach(function() {
        module = Object.create(behaviors['characters-left']);
    });

    it('initializes counter to length difference', function() {
        var page = makePage(
            '<input id="target" value="" maxlength="1"/>' +
            '<characters-left in="target"></characters-left>'
        );
        module.document = page;
        var counter = page.querySelector('characters-left');

        module.checkCounters();

        expect(counter.innerHTML).toBe('1');
    });

    it('detects overflow', function() {
        var page = makePage(
            '<input id="target" value="aaa" data-val-length-max="1"/>' +
            '<characters-left in="target"></characters-left>'
        );
        module.document = page;
        var counter = page.querySelector('characters-left');

        module.checkCounters();

        expect(counter.getAttribute(module.overflowAttribute)).toBe("true");
        expect(counter.innerHTML).toBe('2');
    });

    it('counts remaining characters', function() {
        var page = makePage(
            '<input id="target" value="" maxlength="7" />' +
            '<characters-left in="target"></characters-left>'
        );
        module.document = page;
        var counter = page.querySelector('characters-left');

        module.checkCounters();

        expect(counter.innerHTML).toBe('7');
    });
});

describe('splice-into ', function() { /*globals behaviors, makePage, make, doNothing*/
    'use strict';

    var module;

    beforeEach(function() {
        module = Object.create(behaviors['splice-into']);
    });

    it('checks splicer forms', function() {
        module.document = makePage(
            '<form id="ignored"></form>' +
            '<form id="ignored-as-well" splice-into="" splice-into-registered></form>' +
            '<form id="targeted" splice-into=""></form>'
        );
        module.trackForm = jasmine.createSpy('trackFormFake');

        module.scanForms();

        var target = module.document.querySelector('#targeted');
        expect(module.trackForm).toHaveBeenCalledWith(target, 0, jasmine.any(Array));
    });

    it('registers tracked forms', function() {
        var form = make('<form></form>');

        module.trackForm(form);

        expect(form.hasAttribute(module.registered)).toBe(true);
    });

    it('processes form submits', function() {
        var form = {
            addEventListener : jasmine.createSpy('addEventListenerFake'),
            querySelectorAll : function(){ return []; },
            setAttribute: doNothing,
        };

        module.trackForm(form);

        expect(form.addEventListener).toHaveBeenCalledWith('submit', jasmine.any(Function));
    });

    it('tracks last clicked button ', function() {
        var form = make('<form>' +
            '<button type="submit"></button> ' +
            '</form>');
        module.trackForm(form);
        form.querySelector('button').click(); //simulates previous click

        var button = form.querySelector('button');
        button.click();

        expect(module.submittingButton).toBe(button);
    });

    it('sets loading attrs', function(){
        var page = makePage(
            '<form action="." method="post" splice-into="#target"></form>' +
            '<div id="target"></div>'
        );
        module.document = page;
        module.loadPage = doNothing;
        var form = page.querySelector('form');

        module.processFormSubmit({ target: form, preventDefault: doNothing });

        var target = page.querySelector('#target');
        expect(target.hasAttribute(module.loading)).toBe(true);
    });

    it('respects override attribute on buttons', function(){
        var page = makePage(
            '<form splice-into="#target">' +
            '<button splice-into-disabled></button>' +
            '</form>'
        );
        module.loadPage = jasmine.createSpy('fakeLoadPage');
        module.submittingButton = page.querySelector('button');
        var form = page.querySelector('form');
        var fakePreventDefault = jasmine.createSpy('preventDefaultFake');

        module.processFormSubmit({ target: form, preventDefault: fakePreventDefault });

        expect(fakePreventDefault).not.toHaveBeenCalled();
        expect(module.loadPage).not.toHaveBeenCalled();
    });

    it('targets specified page', function(){
        var page = makePage(
            '<form splice-into="#target" method="post" action="http://example.com">'+
            '<input name="x" value="y" />' +
            '</form>' +
            '<div id="target"></div>'
        );
        module.loadPage = jasmine.createSpy('fakeLoadPage');
        var form = page.querySelector('form');

        module.processFormSubmit({ target: form, preventDefault: doNothing });

        expect(module.loadPage).toHaveBeenCalledWith('post', 'http://example.com/?x=y', jasmine.any(Function));
    });

    it('serializes forms', function(){
        var page = makePage(
            '<form>'+
            '<input name="text" value="a"/>' +
            '<input type="CheckBox" name="kept-checkbox" value="b" checked/>' +
            '<input type="CheckBox" name="skipped-checkbox" value="x"/>' +
            '<select name="dropdown">'+
                '<option value="x"><option>' +
                '<option value="c" selected><option>' +
            '</select>' +
            '<textarea name="multiline">d</textarea>' +
            '<button name="skipped-button" value="x"></button>'+
            '<button name="submitting-button" value="e"></button>'+
            '</form>'
        );
        var form = page.querySelector('form');
        module.submittingButton = page.querySelector('[name=submitting-button]');

        var result = module.serializeForm(form);

        expect(result).toBe('text=a&kept-checkbox=b&dropdown=c&multiline=d&submitting-button=e');
    });

    it('composes URLs semantically', function(){
        var result = module.composeURL('http://example.com/?x=y', 'a=b');

        expect(result).toBe('http://example.com/?a=b');
    });

    it('replaces elements', function(){
        var page = makePage('<div id="target">original</div>');
        var nextPage = makePage('<div id="target">replaced</div>');
        var targetElement = page.querySelector('#target');

        module.replaceWithTwin(nextPage, targetElement);

        var result = page.querySelector('#target').innerHTML;
        expect(result).toBe('replaced');
    });

    it('parses page', function(){
        var html = '<html><body><div id="target"></div></body></html>';

        var page = module.parsePage(html);

        var testElement = page.querySelector('#target');
        expect(testElement).not.toBe(null);
    });
});

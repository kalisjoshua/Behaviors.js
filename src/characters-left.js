/** @summary: Counts and displays how many characters are left before the field overflows.
    @example: <input id="fieldId" maxlength="10"/> <characters-left in="fieldId"></characters-left>
    @description: Uses length from either maxlength or data-val-length-max attributes
    on the target field. characters-left element receives an attribute named 'overflow'
    which is set to 'true' when the textbox goes over the limit and 'false' otherwise. */
(function charactersLeftIIFE() { /*global document, $registerBehavior */
    'use strict';

    ({
        name: 'characters-left',
        overflowAttribute: 'overflow',
        pollRate: 50, //ms
        document: document, //for testing and other clever things

        init: function init() {
            if (typeof $registerBehavior === 'function') {
                $registerBehavior(this); //for testing and other clever things
            }
            this.keepTicking();
        },

        keepTicking: function keepTicking() {
            this.checkCounters();
            setTimeout(keepTicking.bind(this), this.pollRate);
        },

        checkCounters: function checkCounters() {
            Array.prototype.slice.call(this.document.querySelectorAll(this.name))
                .forEach(this.updateCounter, this);
        },

        updateCounter: function updateCounter(counter) {
            var fieldId = counter.getAttribute('in'),
                field = this.document.getElementById(fieldId),
                maxLength = field.getAttribute('maxlength') || field.getAttribute('data-val-length-max'),
                overflow = field.value.length - maxLength,
                difference = Math.abs(overflow);

            if (counter.innerHTML === difference.toString()) { //text length did not change
                return;
            }

            counter.setAttribute(this.overflowAttribute, overflow > 0);
            counter.innerHTML = difference;
        }
    }).init();
}());

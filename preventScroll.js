'use strict';

(function () {
    var keycode = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    };

    var getTouchTarget = function getTouchTarget(e) {
        return e.targetTouches[0];
    };

    var getWheelDirection = function getWheelDirection(e) {
        return e.deltaX || e.deltaY || 0;
    };
    var getKeydownDirection = function getKeydownDirection(e) {
        return e.keyCode === keycode.LEFT || e.keyCode === keycode.UP ? -1 : 1;
    };

    var getTouchDirection = function getTouchDirection(posAttribute, startX, startY) {
        return function (e) {
            var target = getTouchTarget(e);
            return target.pageY > startY ? -1 : 1;
        };
    };

    var createScrollableChecker = function createScrollableChecker(el, axis) {
        return function (direction) {
            var scrollPos = axis === 'x' ? el.scrollLeft : el.scrollTop;

            if (direction < 0) {
                return scrollPos > 0;
            } else {
                var offsetSize = axis === 'x' ? el.offsetWidth : el.offsetHeight,
                    scrollSize = axis === 'x' ? el.scrollWidth : el.scrollHeight;

                return scrollPos + offsetSize < scrollSize;
            }
        };
    };

    self.preventScroll = function (el, axis) {
        var isScrollable = createScrollableChecker(el, axis);

        var createPreventionHandler = function createPreventionHandler(getDirection) {
            return function (e) {
                if (!isScrollable(getDirection(e))) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
        };

        var mouseWheelHandler = createPreventionHandler(getWheelDirection),
            keydownHandler = createPreventionHandler(getKeydownDirection);

        var touchStartHandler = function touchStartHandler(e) {
            var target = getTouchTarget(e),
                touchMoveHandler = createPreventionHandler(getTouchDirection(axis, target.pageX, target.pageY));

            el.addEventListener('touchmove', touchMoveHandler);
            el.addEventListener('touchend', function touchEndHandler(e) {
                el.removeEventListener('touchmove', touchMoveHandler);
                el.removeEventListener('touchend', touchEndHandler);
            });
        };

        // add actual scroll prevention handlers to element
        el.addEventListener('mousewheel', mouseWheelHandler);
        el.addEventListener('touchstart', touchStartHandler);
        el.addEventListener('keydown', keydownHandler);

        // return method to reenable scrolling
        return function () {
            el.removeEventListener('mousewheel', mouseWheelHandler);
            el.removeEventListener('touchstart', touchStartHandler);
            el.removeEventListener('keydown', keydownHandler);
        };
    };
})();

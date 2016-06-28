'use strict';

(function () {
    var keycode = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    };

    var preventedElements = new Map();

    var getTouchTarget = function getTouchTarget(e) {
        return e.targetTouches[0];
    };

    var getWheelAxis = function getWheelAxis(e) {
        return e.deltaX && 'x' || e.deltaY && 'y' || null;
    };
    var getWheelDirection = function getWheelDirection(e) {
        return e.deltaX || e.deltaY || 0;
    };

    var getKeydownAxis = function getKeydownAxis(e) {
        return e.keyCode === keycode.LEFT || e.keyCode === keycode.RIGHT ? 'x' : 'y';
    };
    var getKeydownDirection = function getKeydownDirection(e) {
        return e.keyCode === keycode.LEFT || e.keyCode === keycode.UP ? -1 : 1;
    };

    var getTouchMoveDirection = function getTouchMoveDirection(e) {
        return 0;
    };

    var createScrollPosGetter = function createScrollPosGetter(el) {
        return function (axis) {
            return axis === 'x' ? el.scrollLeft : el.scrollTop;
        };
    };
    var createScrollSizeGetter = function createScrollSizeGetter(el) {
        return function (axis) {
            return axis === 'x' ? el.scrollWidth : el.scrollHeight;
        };
    };
    var createOffsetSizeGetter = function createOffsetSizeGetter(el) {
        return function (axis) {
            return axis === 'x' ? el.offsetWidth : el.offsetHeight;
        };
    };

    var createScrollableChecker = function createScrollableChecker(el) {
        var getScrollPos = createScrollPosGetter(el),
            getOffsetSize = createOffsetSizeGetter(el),
            getScrollSize = createScrollSizeGetter(el);

        return function (axis, direction) {
            if (direction < 0) {
                return getScrollPos(axis) > 0;
            } else {
                return getScrollPos(axis) + getOffsetSize(axis) < getScrollSize(axis);
            }
        };
    };

    self.preventScroll = function (el, axis) {
        var isScrollable = createScrollableChecker(el);

        var createPreventionHandler = function createPreventionHandler(getDirection) {
            return function (e) {
                if (!isScrollable(axis, getDirection(e))) {
                    e.preventDefault();
                }
            };
        };

        var mouseWheelHandler = createPreventionHandler(getWheelDirection);
        var keydownHandler = createPreventionHandler(getKeydownDirection);
        var touchMoveHandler = createPreventionHandler(getTouchMoveDirection);

        var createTouchMoveHandler = function createTouchMoveHandler(startX, startY) {
            return function (e) {
                var target = getTouchTarget(e),
                    direction = target.pageY > startY ? -1 : 1;

                if (!isScrollable(axis, direction)) {
                    e.preventDefault();
                }
            };
        };

        var touchStartHandler = function touchStartHandler(e) {
            var target = getTouchTarget(e);
            var touchMoveHandler = createTouchMoveHandler(target.pageX, target.pageY);

            el.addEventListener('touchmove', touchMoveHandler);
            el.addEventListener('touchend', function touchEndHandler(e) {
                el.removeEventListener('touchmove', touchMoveHandler);
                el.removeEventListener('touchend', touchEndHandler);
            });
        };

        el.addEventListener('mousewheel', mouseWheelHandler);
        el.addEventListener('touchstart', touchStartHandler);
        el.addEventListener('keydown', keydownHandler);

        // set html attributes and style to enable keyboard scroll handling
        el.tabIndex = -1;
        el.style.outline = 'none';
        el.focus();

        preventedElements.set(el, {
            mousewheel: mouseWheelHandler,
            touchstart: touchStartHandler,
            keydown: keydownHandler
        });
    };

    self.allowScroll = function (el) {
        var handlers = preventedElements.get(el);

        if (handlers) {
            for (var eventType in handlers) {
                if (handlers.hasOwnProperty(eventType)) {
                    el.removeEventListener(eventType, handlers[eventType]);
                }
            }
        }
    };
})();

preventScroll(window.wrapper, 'y');

document.onclick = function (el) {
    allowScroll(window.wrapper);
};

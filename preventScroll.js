'use strict';

(function () {
    var getTouchTarget = function getTouchTarget(e) {
        return e.targetTouches[0];
    };

    var keycode = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    };

    self.preventScroll = function (el, axis) {
        var getScrollPos = function getScrollPos(axis) {
            return axis === 'x' ? el.scrollLeft : el.scrollTop;
        };
        var getScrollSize = function getScrollSize(axis) {
            return axis === 'x' ? el.scrollWidth : el.scrollHeight;
        };
        var getOffsetSize = function getOffsetSize(axis) {
            return axis === 'x' ? el.offsetWidth : el.offsetHeight;
        };

        var isScrollable = function isScrollable(el) {
            return function (axis, direction) {
                if (direction < 0) {
                    return getScrollPos(axis) > 0;
                } else {
                    return getScrollPos(axis) + getOffsetSize(axis) < getScrollSize(axis);
                }
            };
        };

        var createTouchMoveHandler = function createTouchMoveHandler(startX, startY) {
            return function (e) {
                var target = getTouchTarget(e);
                var axis = 'y';
                var direction = target.pageY > startY ? -1 : 1;

                if (!isScrollable(el)(axis, direction)) {
                    e.preventDefault();
                }
            };
        };

        el.addEventListener('mousewheel', function (e) {
            var axis = e.deltaX && 'x' || e.deltaY && 'y' || null;

            if (axis) {
                var direction = e.deltaX || e.deltaY;

                if (!isScrollable(el)(axis, direction)) {
                    e.preventDefault();
                }
            }
        });

        el.addEventListener('touchstart', function (e) {
            var target = getTouchTarget(e);
            var touchMoveHandler = createTouchMoveHandler(target.pageX, target.pageY);

            el.addEventListener('touchmove', touchMoveHandler);
            el.addEventListener('touchend', function touchEndHandler(e) {
                el.removeEventListener('touchmove', touchMoveHandler);
                el.removeEventListener('touchend', touchEndHandler);
            });
        });

        document.addEventListener('keydown', function (e) {
            var axis = e.keyCode === keycode.LEFT || e.keyCode === keycode.RIGHT ? 'x' : 'y';
            var direction = e.keyCode === keycode.LEFT || e.keyCode === keycode.UP ? -1 : 1;

            if (!isScrollable(el)(axis, direction)) {
                e.preventDefault();
            }
        });
    };
})();

preventScroll(window.wrapper, 'y');

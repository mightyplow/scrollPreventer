(function () {
    const keycode = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    }

    const preventedElements = new Map;

    const getTouchTarget = e => e.targetTouches[0]  

    const getWheelAxis = e => e.deltaX && 'x' || e.deltaY && 'y' || null
    const getWheelDirection = e => e.deltaX || e.deltaY || 0

    const getKeydownAxis = e => e.keyCode === keycode.LEFT || e.keyCode === keycode.RIGHT ? 'x' : 'y'
    const getKeydownDirection = e => e.keyCode === keycode.LEFT || e.keyCode === keycode.UP ? -1 : 1

    const getTouchMoveDirection = e => 0;

    const createScrollPosGetter = el => axis =>  axis === 'x' ? el.scrollLeft : el.scrollTop
    const createScrollSizeGetter = el => axis => axis === 'x' ? el.scrollWidth : el.scrollHeight
    const createOffsetSizeGetter = el => axis => axis === 'x' ? el.offsetWidth : el.offsetHeight

    const createScrollableChecker = (el) => {
        const getScrollPos = createScrollPosGetter(el),
              getOffsetSize = createOffsetSizeGetter(el),
              getScrollSize = createScrollSizeGetter(el)

        return (axis, direction) => {
            if (direction < 0) {
                return getScrollPos(axis) > 0
            } else {
                return (getScrollPos(axis) + getOffsetSize(axis)) < getScrollSize(axis)
            }
        }
    }

    self.preventScroll = (el, axis) => {
        const isScrollable = createScrollableChecker(el)

        const createPreventionHandler = getDirection => e => {
            if (!isScrollable(axis, getDirection(e))) {
                e.preventDefault()
            }
        }

        const mouseWheelHandler = createPreventionHandler(getWheelDirection)
        const keydownHandler = createPreventionHandler(getKeydownDirection)
        const touchMoveHandler = createPreventionHandler(getTouchMoveDirection)

        const createTouchMoveHandler = (startX, startY) => (e) => {
            const target = getTouchTarget(e),
                  direction = target.pageY > startY ? -1 : 1

            if (!isScrollable(axis, direction)) {
                e.preventDefault()
            }
        }

        const touchStartHandler = e => {
            const target = getTouchTarget(e)
            const touchMoveHandler = createTouchMoveHandler(target.pageX, target.pageY)

            el.addEventListener('touchmove', touchMoveHandler)
            el.addEventListener('touchend', function touchEndHandler (e) {
                el.removeEventListener('touchmove', touchMoveHandler)
                el.removeEventListener('touchend', touchEndHandler)
            })
        }

        el.addEventListener('mousewheel', mouseWheelHandler)
        el.addEventListener('touchstart', touchStartHandler)
        el.addEventListener('keydown', keydownHandler)

        // set html attributes and style to enable keyboard scroll handling
        el.tabIndex = -1
        el.style.outline = 'none'
        el.focus()

        preventedElements.set(el, {
            mousewheel: mouseWheelHandler,
            touchstart: touchStartHandler,
            keydown: keydownHandler
        })
    }

    self.allowScroll = el => {
        const handlers = preventedElements.get(el)

        if (handlers) {
            for (const eventType in handlers) {
                if (handlers.hasOwnProperty(eventType)) {
                    el.removeEventListener(eventType, handlers[eventType]);
                }
            }
        }
    }
}());

preventScroll(window.wrapper, 'y')

document.onclick = el => {
    allowScroll(window.wrapper)
}

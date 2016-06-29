(function () {
    const keycode = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    }

    const getTouchTarget = e => e.targetTouches[0]

    const getWheelDirection = e => e.deltaX || e.deltaY || 0
    const getKeydownDirection = e => e.keyCode === keycode.LEFT || e.keyCode === keycode.UP ? -1 : 1

    const getTouchDirection = (posAttribute, startX, startY) => e => {
        const target = getTouchTarget(e)
        return target.pageY > startY ? -1 : 1
    }

    const createScrollableChecker = (el, axis) => direction => {
        const scrollPos = axis === 'x' ? el.scrollLeft : el.scrollTop

        if (direction < 0) {
            return scrollPos > 0
        } else {
            const offsetSize = axis === 'x' ? el.offsetWidth : el.offsetHeight,
                  scrollSize = axis === 'x' ? el.scrollWidth : el.scrollHeight

            return (scrollPos + offsetSize) < scrollSize
        }
    }

    self.preventScroll = (el, axis) => {
        const isScrollable = createScrollableChecker(el, axis)

        const createPreventionHandler = getDirection => e => {
            if (!isScrollable(getDirection(e))) {
                e.preventDefault()
                e.stopPropagation()
            }
        }

        const mouseWheelHandler = createPreventionHandler(getWheelDirection),
              keydownHandler = createPreventionHandler(getKeydownDirection)

        const touchStartHandler = e => {
            const target = getTouchTarget(e),
                  touchMoveHandler = createPreventionHandler(getTouchDirection(axis, target.pageX, target.pageY))

            el.addEventListener('touchmove', touchMoveHandler)
            el.addEventListener('touchend', function touchEndHandler (e) {
                el.removeEventListener('touchmove', touchMoveHandler)
                el.removeEventListener('touchend', touchEndHandler)
            })
        }

        // add actual scroll prevention handlers to element
        el.addEventListener('mousewheel', mouseWheelHandler)
        el.addEventListener('touchstart', touchStartHandler)
        el.addEventListener('keydown', keydownHandler)

        // return method to reenable scrolling
        return () => {
            el.removeEventListener('mousewheel', mouseWheelHandler)
            el.removeEventListener('touchstart', touchStartHandler)
            el.removeEventListener('keydown', keydownHandler)
        }
    }
}());
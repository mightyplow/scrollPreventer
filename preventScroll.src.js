(function () {
    const getTouchTarget = e => e.targetTouches[0]

    const keycode = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    }

    self.preventScroll = (el, axis) => {
        const getScrollPos = (axis) =>  axis === 'x' ? el.scrollLeft : el.scrollTop
        const getScrollSize = (axis) => axis === 'x' ? el.scrollWidth : el.scrollHeight
        const getOffsetSize = (axis) => axis === 'x' ? el.offsetWidth : el.offsetHeight
        
        const isScrollable = (el) => (axis, direction) => {
            if (direction < 0) {
                return getScrollPos(axis) > 0
            } else {
                return (getScrollPos(axis) + getOffsetSize(axis)) < getScrollSize(axis)
            }
        }

        const createTouchMoveHandler = (startX, startY) => (e) => {
            const target = getTouchTarget(e)
            const axis = 'y'
            const direction = target.pageY > startY ? -1 : 1

            if (!isScrollable(el)(axis, direction)) {
                e.preventDefault()
            }
        }

        el.addEventListener('mousewheel', e => {
            const axis = e.deltaX && 'x' || e.deltaY && 'y' || null;

            if (axis) {
                const direction = e.deltaX || e.deltaY

                if (!isScrollable(el)(axis, direction)) {
                    e.preventDefault()
                }
            }
        })

        el.addEventListener('touchstart', e => {
            const target = getTouchTarget(e)
            const touchMoveHandler = createTouchMoveHandler(target.pageX, target.pageY)

            el.addEventListener('touchmove', touchMoveHandler)
            el.addEventListener('touchend', function touchEndHandler (e) {
                el.removeEventListener('touchmove', touchMoveHandler)
                el.removeEventListener('touchend', touchEndHandler)
            })
        })

        document.addEventListener('keydown', e => {
            const axis = e.keyCode === keycode.LEFT || e.keyCode === keycode.RIGHT ? 'x' : 'y'
            const direction = e.keyCode === keycode.LEFT || e.keyCode === keycode.UP ? -1 : 1

            if (!isScrollable(el)(axis, direction)) {
                e.preventDefault()
            }
        })
    }
}());

preventScroll(window.wrapper, 'y')
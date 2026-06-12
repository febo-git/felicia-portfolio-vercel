const scrollHeader = () => {
    const header = document.querySelector('.site-header')
    if (!header) return

    const tabsWrapper = document.querySelector('.project-tabs .tabs__buttons')

    const THRESHOLD = 60
    let lastScrollY = window.scrollY
    let anchorY = window.scrollY
    let lastDir = 'down'
    let visible = true
    let ticking = false
    let suppressUntil = 0

    const getHeaderHeight = () =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 90

    const setVisible = (v) => {
        if (v === visible) return
        visible = v
        header.classList.toggle('site-header--hidden', !v)
        document.body.classList.toggle('header-hidden', !v)
    }

    const update = () => {
        const y = window.scrollY
        const dir = y > lastScrollY ? 'down' : y < lastScrollY ? 'up' : lastDir

        if (dir !== lastDir) {
            anchorY = y
            lastDir = dir
        }

        // Scroll-direction class for accordion sticky behavior.
        // Open accordion triggers stick only when scrolling DOWN.
        // Scrolling up releases them so all open sections slide back with content.
        // Near the very top (y < 60) we leave it off — nothing to "stick" yet.
        document.body.classList.toggle('scroll-up', dir === 'up' && y > 60)

        // Tab clicks suppress header show/hide for 700ms to prevent content
        // height changes from being misread as a scroll-up event
        if (Date.now() >= suppressUntil) {
            if (y < 10) {
                setVisible(true)
            } else if (dir === 'down' && y - anchorY > THRESHOLD) {
                setVisible(false)
            } else if (dir === 'up' && anchorY - y > THRESHOLD) {
                setVisible(true)
            }
        }

        // Tabs-stuck detection: offset by header height when header is visible
        if (tabsWrapper && tabsWrapper.dataset.initialTop) {
            const initialTop = parseFloat(tabsWrapper.dataset.initialTop)
            const stickTop = visible ? getHeaderHeight() : 0
            const stuck = y + stickTop >= initialTop - 1
            document.body.classList.toggle('tabs-stuck', stuck)
        }

        lastScrollY = y
        ticking = false
    }

    // Suppress header show/hide after a tab click — switching tab content
    // can cause layout shifts that fire misleading scroll events
    document.querySelectorAll('.tabs__button').forEach(btn => {
        btn.addEventListener('click', () => {
            suppressUntil = Date.now() + 700
            anchorY = window.scrollY
            lastScrollY = window.scrollY
        })
    })

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update)
            ticking = true
        }
    }, { passive: true })

    if (tabsWrapper) {
        window.addEventListener('load', () => {
            tabsWrapper.dataset.initialTop = tabsWrapper.getBoundingClientRect().top + window.scrollY
            update()
        })
    }
}

scrollHeader()

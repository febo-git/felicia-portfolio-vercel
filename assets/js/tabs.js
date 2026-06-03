const tabs = () => {
    const tabButtons = document.querySelectorAll('.tabs__button')
    const tabPanels = document.querySelectorAll('.tabs__panel')
    const tabContents = document.querySelectorAll('.tabs__content')

    if (!tabButtons.length) return

    // Set explicit pixel height on each wrapper so CSS can transition from it
    const initHeights = () => {
        tabContents.forEach(wrapper => {
            const active = wrapper.querySelector('.tabs__panel--active')
            if (active) wrapper.style.height = active.scrollHeight + 'px'
        })
    }

    initHeights()

    // Re-measure after fonts load — fallback fonts render at a different size,
    // making the initial scrollHeight stale and causing a jump on first click
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(initHeights)
    }

    // Re-measure after images inside panels load — images contribute 0 height
    // at measure time if they haven't loaded yet, causing the panel to be clipped
    tabPanels.forEach(panel => {
        panel.querySelectorAll('img').forEach(img => {
            if (!img.complete) {
                img.addEventListener('load', initHeights, { once: true })
            }
        })
    })

    // On resize: snap height instantly (no transition) then restore
    window.addEventListener('resize', () => {
        tabContents.forEach(wrapper => {
            const active = wrapper.querySelector('.tabs__panel--active')
            if (!active) return
            wrapper.style.transition = 'none'
            wrapper.style.height = active.scrollHeight + 'px'
            wrapper.offsetHeight // force reflow
            wrapper.style.transition = ''
        })
    })

    const changeTab = (event) => {
        const targetTab = event.currentTarget.dataset.tab
        if (!targetTab) return
        if (event.currentTarget.classList.contains('tabs__button--active')) return

        const targetPanel = document.querySelector(`[data-tab-id="${targetTab}"]`)
        if (!targetPanel) return

        const wrapper = targetPanel.closest('.tabs__content')

        // Read both heights and pin before any DOM changes — prevents a frameless
        // gap where panels are mid-swap and the wrapper has no explicit height
        const toHeight = targetPanel.scrollHeight
        if (wrapper) wrapper.style.height = wrapper.offsetHeight + 'px'

        tabButtons.forEach(btn => btn.classList.remove('tabs__button--active'))
        tabPanels.forEach(panel => panel.classList.remove('tabs__panel--active'))

        event.currentTarget.classList.add('tabs__button--active')
        targetPanel.classList.add('tabs__panel--active')

        if (wrapper) {
            requestAnimationFrame(() => {
                wrapper.style.height = toHeight + 'px'
            })
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', changeTab)
    })
}

tabs()

/**
 * tabs.js — case-study section navigation.
 *
 *   Desktop (>= 769px) : 5 buttons in a row, only one panel visible at a time
 *                        with animated height transitions between panels.
 *   Mobile (<= 768px)  : the buttons row is hidden by CSS. JS turns each
 *                        panel into an accordion item with a sticky trigger.
 *
 * Mode is locked at page load. Resizes across the breakpoint require reload —
 * a deliberate tradeoff for simpler code (the two modes mutate the DOM in
 * incompatible ways).
 */

const isAccordionMode = () => window.matchMedia('(max-width: 768px)').matches

const initDesktopTabs = () => {
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

        // Pin current height before swap so there's no frame with zero height
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

const initMobileAccordion = () => {
    const tabsContainer = document.querySelector('.project-tabs')
    if (!tabsContainer) return

    const tabButtons = tabsContainer.querySelectorAll('.tabs__button')
    const tabPanels = tabsContainer.querySelectorAll('.tabs__panel')
    const tabContent = tabsContainer.querySelector('.tabs__content')
    if (!tabPanels.length || !tabContent) return

    // Map tab id -> label from the existing desktop buttons (preserves casing)
    const labels = {}
    tabButtons.forEach(btn => {
        labels[btn.dataset.tab] = btn.textContent.trim()
    })

    // Insert an accordion trigger before each panel. All start CLOSED — user
    // chooses which section to read. No default open / no red chevron yet.
    //
    // Exception: the "projects" panel (other case studies) is NOT an accordion
    // on mobile. It carries no heading — a single dashed line (drawn in CSS)
    // closes off the accordion list above it, and the cards stay visible,
    // stacked at the end of the page as their own section / scroll destination.
    tabPanels.forEach((panel) => {
        const id = panel.dataset.tabId
        const label = labels[id] || id
        const panelDomId = 'tab-panel-' + id

        if (id === 'projects') {
            panel.classList.remove('tabs__panel--active')
            panel.classList.add('tab-accordion__tail')
            return
        }

        const trigger = document.createElement('button')
        trigger.type = 'button'
        trigger.className = 'tab-accordion__trigger'
        trigger.setAttribute('aria-expanded', 'false')
        trigger.setAttribute('aria-controls', panelDomId)
        trigger.innerHTML =
            '<span class="tab-accordion__title">' + label + '</span>' +
            '<span class="tab-accordion__chevron" aria-hidden="true">' +
                '<svg viewBox="0 0 16 16" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
            '</span>'

        panel.id = panelDomId
        panel.classList.add('tab-accordion__panel')
        // Strip the desktop active state — irrelevant in accordion mode
        panel.classList.remove('tabs__panel--active')

        // Drop the trigger directly before its panel inside the tabs__content
        tabContent.insertBefore(trigger, panel)

        trigger.addEventListener('click', () => {
            const wasOpen = trigger.getAttribute('aria-expanded') === 'true'
            trigger.setAttribute('aria-expanded', String(!wasOpen))
            trigger.classList.toggle('is-open', !wasOpen)
            panel.classList.toggle('tab-accordion__panel--open', !wasOpen)

            // When opening, scroll the trigger into view so the user lands at
            // the top of the section they just expanded. Skip when collapsing —
            // that would yank them away from where they tapped.
            if (!wasOpen) {
                requestAnimationFrame(() => {
                    const headerOffset =
                        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64
                    const rect = trigger.getBoundingClientRect()
                    const targetY = window.scrollY + rect.top - headerOffset - 4
                    window.scrollTo({ top: targetY, behavior: 'smooth' })
                })
            }
        })
    })

    // The desktop tabs.js sets an explicit height on .tabs__content. Clear it
    // here so panels can flow naturally in accordion mode.
    tabContent.style.height = ''
}

if (isAccordionMode()) {
    initMobileAccordion()
} else {
    initDesktopTabs()
}

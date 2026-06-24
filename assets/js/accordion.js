/**
 * accordion.js — toggles the homepage about-section accordions.
 *
 * CSS does the visual work (chevron rotation, content collapse via :has()).
 * This script just flips aria-expanded on the trigger button.
 *
 * Desktop CSS sets `pointer-events: none` on triggers so the click never
 * fires there — the content stays open. No matchMedia check needed in JS.
 */
const accordion = () => {
    const triggers = document.querySelectorAll('.accordion-section__trigger')
    if (!triggers.length) return

    // Mobile starts CLOSED (matching the case-study accordions); the markup
    // ships aria-expanded="true" for desktop, where content is always shown.
    if (window.matchMedia('(max-width: 768px)').matches) {
        triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'))
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true'
            trigger.setAttribute('aria-expanded', !expanded)
        })
    })
}

accordion()

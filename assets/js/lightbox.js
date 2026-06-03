const lightbox = () => {
    const images = document.querySelectorAll('.process-image-wrap:not(.process-image-wrap--no-lightbox) img')
    if (!images.length) return

    const ZOOM_LEVELS = [1, 1.65, 2.5]

    let activeLevels = ZOOM_LEVELS

    const SVG_ZOOM_IN = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`
    const SVG_ZOOM_OUT = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`
    const SVG_GRAB = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`

    let zoomIndex = 0
    let zoomDir = 1        // 1 = zooming in, -1 = zooming out
    let baseDimensions = { w: 0, h: 0 }
    let previousFocus = null
    let overImage = false

    // Drag-to-pan state
    let isDragging = false
    let dragMoved = false
    let dragStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 }

    // ── DOM ───────────────────────────────────────────────────────────────
    const overlay = document.createElement('div')
    overlay.className = 'lightbox'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-label', 'Image viewer')
    overlay.setAttribute('aria-hidden', 'true')

    // scene: min 100% both axes so flex-centering works; grows with zoomed image
    const scene = document.createElement('div')
    scene.className = 'lightbox__scene'

    // wrap: entrance scale animation only — independent of zoom
    const wrap = document.createElement('div')
    wrap.className = 'lightbox__wrap'

    const img = document.createElement('img')
    img.className = 'lightbox__img'
    img.alt = ''

    const closeBtn = document.createElement('button')
    closeBtn.className = 'lightbox__close'
    closeBtn.setAttribute('aria-label', 'Close image viewer')
    closeBtn.innerHTML = `<span class="lightbox__close-label">Close</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`

    const cursor = document.createElement('div')
    cursor.className = 'lightbox__cursor'

    wrap.append(img)
    scene.append(wrap)
    overlay.append(closeBtn, scene, cursor)
    document.body.append(overlay)

    // ── Custom cursor ─────────────────────────────────────────────────────
    const showCursor = () => cursor.classList.add('lightbox__cursor--visible')
    const hideCursor = () => cursor.classList.remove('lightbox__cursor--visible')

    const updateCursor = () => {
        if (overImage) {
            if (zoomDir === 1) {
                cursor.innerHTML = `${SVG_ZOOM_IN}<span>Zoom in</span>`
            } else {
                cursor.innerHTML = `${SVG_ZOOM_OUT}<span>Zoom out</span>`
            }
        } else {
            cursor.innerHTML = `<span>Click to close</span>`
        }
    }

    overlay.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px'
        cursor.style.top = e.clientY + 'px'

        if (isDragging) {
            const dx = e.clientX - dragStart.x
            const dy = e.clientY - dragStart.y
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true
            overlay.scrollLeft = dragStart.scrollLeft - dx
            overlay.scrollTop = dragStart.scrollTop - dy
        }
    })

    overlay.addEventListener('mouseenter', () => {
        if (isDragging) return
        overImage = false
        updateCursor()
        showCursor()
    })

    wrap.addEventListener('mouseenter', e => {
        if (isDragging) return
        e.stopPropagation()
        overImage = true
        updateCursor()
        showCursor()
    })

    wrap.addEventListener('mouseleave', () => {
        if (isDragging) return
        overImage = false
        updateCursor()
    })

    closeBtn.addEventListener('mouseenter', e => {
        e.stopPropagation()
        hideCursor()
    })

    closeBtn.addEventListener('mouseleave', () => {
        if (isDragging) return
        overImage = false
        updateCursor()
        showCursor()
    })

    // ── Drag-to-pan ───────────────────────────────────────────────────────
    wrap.addEventListener('mousedown', e => {
        if (e.button !== 0) return
        isDragging = true
        dragMoved = false
        dragStart = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: overlay.scrollLeft,
            scrollTop: overlay.scrollTop
        }
        overlay.classList.add('lightbox--dragging')
        cursor.innerHTML = SVG_GRAB
        showCursor()
        e.preventDefault()
    })

    document.addEventListener('mouseup', () => {
        if (!isDragging) return
        isDragging = false
        overlay.classList.remove('lightbox--dragging')
        updateCursor()
        if (overImage) showCursor()
    })

    // ── Zoom: explicit dimensions so the container is scrollable ──────────
    const applyDimensions = (instant = false) => {
        const factor = activeLevels[zoomIndex]
        const tr = 'width 380ms cubic-bezier(0.16,1,0.3,1), height 380ms cubic-bezier(0.16,1,0.3,1)'
        img.style.transition = instant ? 'none' : tr
        img.style.maxWidth = 'none'
        img.style.maxHeight = 'none'
        img.style.width = Math.round(baseDimensions.w * factor) + 'px'
        img.style.height = Math.round(baseDimensions.h * factor) + 'px'
        if (instant) {
            img.offsetHeight // force reflow
            img.style.transition = ''
        }
    }

    // ── Open / close ──────────────────────────────────────────────────────
    const open = (src, alt, levels) => {
        previousFocus = document.activeElement
        zoomIndex = 0
        zoomDir = 1
        activeLevels = levels || ZOOM_LEVELS

        // Reset inline styles so CSS constraints size the image for measurement
        img.removeAttribute('style')
        img.src = src
        img.alt = alt || ''

        document.body.style.overflow = 'hidden'
        overlay.setAttribute('aria-hidden', 'false')

        const measure = () => {
            baseDimensions = { w: img.offsetWidth, h: img.offsetHeight }
            if (baseDimensions.w > 0) applyDimensions(true)
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('lightbox--visible')
                // Measure after overlay is visible and image has layout dimensions
                if (img.complete && img.naturalWidth) {
                    measure()
                } else {
                    img.addEventListener('load', measure, { once: true })
                }
                closeBtn.focus()
            })
        })
    }

    const close = () => {
        overlay.classList.remove('lightbox--visible')
        overlay.setAttribute('aria-hidden', 'true')
        hideCursor()
        setTimeout(() => {
            document.body.style.overflow = ''
            zoomIndex = 0
            zoomDir = 1
            img.removeAttribute('style')
            if (previousFocus) previousFocus.focus()
            // Re-measure active tab panel — body overflow change can cause reflow
            const activePanel = document.querySelector('.tabs__panel--active')
            if (activePanel) {
                const wrapper = activePanel.closest('.tabs__content')
                if (wrapper) wrapper.style.height = activePanel.scrollHeight + 'px'
            }
        }, 320)
    }

    // ── Zoom on image click (ping-pong through levels, zooms to click point) ─
    img.addEventListener('click', e => {
        e.stopPropagation()
        if (dragMoved) { dragMoved = false; return }

        // Record click position relative to image and overlay before resizing
        const imgRect = img.getBoundingClientRect()
        const overlayRect = overlay.getBoundingClientRect()
        const imgClickX = e.clientX - imgRect.left
        const imgClickY = e.clientY - imgRect.top
        const viewX = e.clientX - overlayRect.left
        const viewY = e.clientY - overlayRect.top
        const oldFactor = activeLevels[zoomIndex]

        zoomIndex += zoomDir
        if (zoomIndex >= activeLevels.length - 1) {
            zoomIndex = activeLevels.length - 1
            zoomDir = -1
        } else if (zoomIndex <= 0) {
            zoomIndex = 0
            zoomDir = 1
        }

        const newFactor = activeLevels[zoomIndex]

        // Instant resize so the scroll container has its final size before we scroll
        applyDimensions(true)

        // Scroll so the clicked image point stays under the cursor
        const newImgW = Math.round(baseDimensions.w * newFactor)
        const newImgH = Math.round(baseDimensions.h * newFactor)
        const scale = newFactor / oldFactor
        const offsetX = Math.max(0, (overlay.clientWidth  - newImgW) / 2)
        const offsetY = Math.max(0, (overlay.clientHeight - newImgH) / 2)
        overlay.scrollLeft = offsetX + imgClickX * scale - viewX
        overlay.scrollTop  = offsetY + imgClickY * scale - viewY

        updateCursor()
    })

    // ── Close triggers ────────────────────────────────────────────────────
    closeBtn.addEventListener('click', close)

    overlay.addEventListener('click', e => {
        if (!wrap.contains(e.target) && !closeBtn.contains(e.target)) close()
    })

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('lightbox--visible')) close()
    })

    // ── Trigger images ────────────────────────────────────────────────────
    images.forEach(image => {
        image.style.cursor = 'zoom-in'
        image.addEventListener('click', () => {
            const raw = image.dataset.zoomLevels
            const levels = raw ? raw.split(',').map(Number) : null
            open(image.src, image.alt, levels)
        })
    })
}

lightbox()

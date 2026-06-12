const mobileMenu = () => {
    const menuToggle = document.querySelector('.menu__toggle')
    const responsiveMenu = document.querySelector('.responsive-menu')
    const closeButton = document.querySelector('.responsive-menu__close')
    const menuInner = document.querySelector('.responsive-menu__inner')

    if (!menuToggle || !responsiveMenu) return

    const openMenu = () => {
        responsiveMenu.classList.add('responsive-menu--visible')
        responsiveMenu.setAttribute('aria-hidden', 'false')
        menuToggle.setAttribute('aria-expanded', 'true')
        document.body.classList.add('menu-open')
    }

    const closeMenu = () => {
        responsiveMenu.classList.remove('responsive-menu--visible')
        responsiveMenu.setAttribute('aria-hidden', 'true')
        menuToggle.setAttribute('aria-expanded', 'false')
        document.body.classList.remove('menu-open')
    }

    menuToggle.addEventListener('click', openMenu)

    // Dev/test hook: ?menu=open opens the menu on load. Safe in production
    // (no-op without the param) and lets test harnesses screenshot the menu.
    if (new URLSearchParams(window.location.search).get('menu') === 'open') {
        openMenu()
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeMenu)
    }

    // Any link inside the overlay closes it on tap (lets the page navigate)
    responsiveMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu)
    })

    // Click on the overlay backdrop (outside the inner content) closes it
    responsiveMenu.addEventListener('click', (event) => {
        if (menuInner && !menuInner.contains(event.target)) {
            closeMenu()
        }
    })

    // Escape key closes the menu
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && responsiveMenu.classList.contains('responsive-menu--visible')) {
            closeMenu()
        }
    })
}

mobileMenu()

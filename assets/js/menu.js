const mobileMenu = () => {
    const menuToggle = document.querySelector('.menu__toggle')
    const responsiveMenu = document.querySelector('.responsive-menu')
    const closeButton = document.querySelector('.responsive-menu__close')
    const menuLinks = document.querySelectorAll('.responsive-menu__link')

    if (!menuToggle || !responsiveMenu) return

    const openMenu = () => {
        responsiveMenu.classList.add('responsive-menu--visible')
        responsiveMenu.setAttribute('aria-hidden', 'false')
        menuToggle.setAttribute('aria-expanded', 'true')
    }

    const closeMenu = () => {
        responsiveMenu.classList.remove('responsive-menu--visible')
        responsiveMenu.setAttribute('aria-hidden', 'true')
        menuToggle.setAttribute('aria-expanded', 'false')
    }

    menuToggle.addEventListener('click', openMenu)

    if (closeButton) {
        closeButton.addEventListener('click', closeMenu)
    }

    menuLinks.forEach(link => link.addEventListener('click', closeMenu))
}

mobileMenu()

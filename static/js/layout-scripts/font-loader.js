'use strict'

async function loadFonts () {
    const font = new FontFace('Barlow', 'url("../fonts/Barlow-Regular.ttf")')
    await font.load()

    document.fonts.add(font)
    document.body.classList.add('fonts-loaded')
}

loadFonts()

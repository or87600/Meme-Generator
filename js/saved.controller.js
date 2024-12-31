'use strict'

function renderSavedMemes() {
    const savedMemes = getSavedMemes()
    const elSavedMemes = document.querySelector('.saved-memes')

    const strHtml = savedMemes.map(meme => `
        <img src="${meme.url}"
        alt="meme number ${meme.selectedImgId}"
        onclick="onOpenSavedMeme(${meme.selectedImgId})">
    `)

    elSavedMemes.innerHTML = strHtml.join('')
}

function onOpenSavedMeme(memeId) {
    const meme = getSavedMemeById(memeId)
    setMeme(meme)
    onChangeLayout('editor')
    renderMeme()
}
'use strict'

let gPageState = 'gallery'


function onInit() {
    renderGallery()
}

function renderGallery() {

    const memesImgs = getMemesImgs()
    const elGallery = document.querySelector('.memes-gallery')

    const strHtml = memesImgs.map(meme => `
        <img src="${meme.url}"
        alt="meme number ${meme.id}"
        onclick="onClickMeme(${meme.id})">
    `)

    elGallery.innerHTML = strHtml.join('')
}

function onClickMeme(memeId) {
    resetMeme()
    const meme = getMeme()
    meme.selectedImgId = memeId
    onChangeLayout('editor')
    updateEditorFields(true)
    renderMeme()
}

/* -------- General -------- */

function onChangeLayout(section) {
    const elGallery = document.querySelector('.memes-gallery')
    const elSaved = document.querySelector('.saved-memes')
    const elEditor = document.querySelector('.editor-container')

    if (section === 'gallery') {
        elGallery.classList.remove('hidden')
        elSaved.classList.add('hidden')
        elEditor.classList.add('hidden')
    } else if (section === 'saved') {
        elGallery.classList.add('hidden')
        elSaved.classList.remove('hidden')
        elEditor.classList.add('hidden')
    } else if (section === 'editor') {
        elGallery.classList.add('hidden')
        elSaved.classList.add('hidden')
        elEditor.classList.remove('hidden')
    }
}

function onToggleMenu() {
    if (window.innerWidth <= 650) {
        document.body.classList.toggle('openedMenu')
    }
}
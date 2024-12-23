'use strict'

let gPageState = 'gallery'
let gElCanvas
let gCtx
let gCurrentMeme = null
let gFocusedLineIdx = null
let gTextSizeInterval

function onInit() {
    if (gPageState === 'gallery') renderGallery()
    else if (gPageState === 'saved') renderSaved()
    else if (gPageState === 'editor') renderEditor()
}

function renderGallery() {

    const memesImgs = getMemesImgs()
    const elGallery = document.querySelector('.memes-gallery')

    const strHtml = memesImgs.map(meme => `
        <img src="${meme.url}"
        alt="meme number ${meme.id}"
        onclick="onClickMeme(${meme.id})">
    `)

    elGallery.hidden = false
    elGallery.innerHTML = strHtml.join('')
}

function renderEditor() {
    const meme = getMeme()
    const memesImgs = getMemesImgs()

    gElCanvas = document.querySelector('canvas.meme')
    gCtx = gElCanvas.getContext('2d')

    const selectedImg = memesImgs.find(img => img.id === meme.selectedImgId)
    gCurrentMeme = new Image()
    gCurrentMeme.src = selectedImg.url

    gCurrentMeme.onload = () => {
        coverCanvasWithImg(gCurrentMeme)
        renderText()
        if (!meme.lines) updateEditorFields(true)
        else updateEditorFields()
    }
}

function coverCanvasWithImg(gCurrentMeme) {
    const imgRatio = gCurrentMeme.naturalWidth / gCurrentMeme.naturalHeight;
    if (gElCanvas.width / gElCanvas.height > imgRatio) {
        gElCanvas.height = gElCanvas.width / imgRatio;
    } else {
        gElCanvas.width = gElCanvas.height * imgRatio;
    }
    gCtx.drawImage(gCurrentMeme, 0, 0, gElCanvas.width, gElCanvas.height);
}

function renderText() {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!meme || !lines || lines.length === 0) return

    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)

    if (gCurrentMeme) coverCanvasWithImg(gCurrentMeme)

    const lineHeight = 50
    const padding = 2
    const margin = 5

    lines.forEach((line, idx) => {
        gCtx.font = `${line.size}px ${line.font}`
        gCtx.lineWidth = 2
        gCtx.lineJoin = 'round'
        gCtx.lineCap = 'round'

        gCtx.strokeStyle = line.stroke
        gCtx.fillStyle = line.fill
        gCtx.textAlign = 'center'

        let yPosition
        if (idx === 0) {
            yPosition = lineHeight + padding
        } else if (idx === 1) {
            yPosition = gElCanvas.height - lineHeight
        } else {
            yPosition = gElCanvas.height / 2
        }

        gCtx.strokeText(line.txt, gElCanvas.width / 2, yPosition)
        gCtx.fillText(line.txt, gElCanvas.width / 2, yPosition)

        if (idx === selectedLineIdx) {
            gCtx.strokeStyle = line.stroke
            gCtx.strokeRect(
                gElCanvas.width / 2 - gCtx.measureText(line.txt).width / 2 - 10,
                yPosition - line.size - 5,
                gCtx.measureText(line.txt).width + 20,
                line.size + 20
            );
        }
    })
}

function onClickMeme(memeId) {
    const meme = getMeme()
    meme.selectedImgId = memeId
    gPageState = 'editor'
    onChangeLayout('editor')
    onInit()
}

/* -------- LINES ACTIONS -------- */

function onUpdateText(elInput) {
    const inputValue = elInput.value
    updateText(inputValue)
    renderText()

    updateEditorFields()
    renderEditor()
}

function onSwitchLine() {
    switchLine()
    renderText()

    updateEditorFields()
    renderEditor()
}

function onAddLine() {
    addLine()
    renderText()

    updateEditorFields()
    renderEditor()
}

function onRemoveLine() {
    removeLine()
    renderText()

    updateEditorFields()
    renderEditor()
}

/* -------- FONT TYPOGRAPGY ACTIONS -------- */

function onChangeTextSizeOnce(diff) {
    changeTextSize(diff)
    renderText()
}

function startChangeTextSize(diff) {
    gTextSizeInterval = setInterval(() => {
        changeTextSize(diff)
        renderText()
    }, 100)
}

function stopChangeTextSize() {
    clearInterval(gTextSizeInterval)
}

function openColorPicker(btnName) {
    if (btnName === 'stroke-btn') document.querySelector('.stroke-clr-picker-input').click()
    else if (btnName === 'fill-btn') document.querySelector('.fill-clr-picker-input').click()
}

function onSelectStrokeColor(input) {
    const color = input.value

    changeStrokeColor(color)
    renderEditor()
}

function onSelectFillColor(input) {
    const color = input.value

    changefillColor(color)
    renderEditor()
}

function onChangeFont() {
    const selectedFont = document.querySelector('.fonts.select').value
    changeFont(selectedFont)
    renderText()
}

/* -------- MEME SAVE/SHARE ACTIONS -------- */

function onDownloadMeme(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg')
    elLink.href = imgContent
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

function updateEditorFields(isReset = false) {
    const meme = getMeme();
    const { selectedLineIdx, lines } = meme;

    const elInput = document.querySelector('.text-input');
    const elStrokeBtn = document.querySelector('.stroke-clr-btn');
    const elFillBtn = document.querySelector('.fill-clr-btn');
    const elFontSelect = document.querySelector('.fonts');

    if (isReset || !lines || lines.length === 0) {
        elInput.value = '';
        elStrokeBtn.style.backgroundColor = '#F0F0F0';
        elFillBtn.style.backgroundColor = '#F0F0F0';
        elFontSelect.value = 'Arial';
    } else {
        const selectedLine = lines[selectedLineIdx];
        elInput.value = (selectedLine.txt === 'Add text here..') ? '' : selectedLine.txt;
        elStrokeBtn.style.backgroundColor = selectedLine.stroke;
        elFillBtn.style.backgroundColor = selectedLine.fill;
        elFontSelect.value = selectedLine.font;
    }
}

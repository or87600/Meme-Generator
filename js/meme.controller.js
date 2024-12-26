'use strict'

let gPageState = 'gallery'
let gElCanvas
let gCtx
let gCurrentMeme = null
let gTextSizeInterval
let gStartPos
const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    if (gPageState === 'gallery') renderGallery()
    else if (gPageState === 'saved') renderSaved()
    else if (gPageState === 'editor') renderMeme()
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

function renderMeme() {
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
        addLinsteners()
    }
}

function coverCanvasWithImg(img) {
    const imgRatio = img.naturalWidth / img.naturalHeight;

    if (gElCanvas.width / gElCanvas.height > imgRatio) {
        gElCanvas.height = gElCanvas.width / imgRatio;
    } else {
        gElCanvas.width = gElCanvas.height * imgRatio;
    }

    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
}

function renderText() {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!meme || !lines || lines.length === 0) return

    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)

    if (gCurrentMeme) coverCanvasWithImg(gCurrentMeme)

    lines.forEach((line, idx) => {
        const { xPos, yPos, txt, size, font, fill, stroke } = line

        gCtx.font = `${size}px ${font}`
        gCtx.lineWidth = 2
        gCtx.lineJoin = 'round'
        gCtx.lineCap = 'round'

        gCtx.strokeStyle = stroke
        gCtx.fillStyle = fill
        gCtx.textAlign = 'center'

        gCtx.strokeText(txt, xPos, yPos)
        gCtx.fillText(txt, xPos, yPos)

        if (idx === selectedLineIdx) {
            const textWidth = gCtx.measureText(txt).width

            gCtx.strokeStyle = stroke
            gCtx.strokeRect(
                xPos - textWidth / 2 - 10,
                yPos - size - 10,
                textWidth + 20,
                size + 20
            )
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

function addLinsteners() {
    addMouseListeners()
    addMouseListeners()
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

/* -------- LINES MOVMENTS -------- */

function getEvPos(ev) {
    const rect = gElCanvas.getBoundingClientRect(); // חישוב גבולות הקנבס
    let pos = {
        x: (ev.clientX - rect.left) * (gElCanvas.width / rect.width),
        y: (ev.clientY - rect.top) * (gElCanvas.height / rect.height),
    };

    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault();
        ev = ev.changedTouches[0];
        pos = {
            x: (ev.pageX - rect.left) * (gElCanvas.width / rect.width),
            y: (ev.pageY - rect.top) * (gElCanvas.height / rect.height),
        };
    }
    return pos;
}

function onDown(ev) {
    const pos = getEvPos(ev)
    const meme = getMeme()
    const { lines } = meme

    lines.forEach((line, idx) => {
        const textWidth = gCtx.measureText(line.txt).width
        if (isLineClicked(pos, line.xPos, line.yPos, textWidth, line.size)) {
            meme.selectedLineIdx = idx
            setLineDrag(true)
            gStartPos = pos
            document.body.style.cursor = 'grabbing'
        }
    })
    renderMeme()
}

function onMove(ev) {
    const meme = getMeme();
    const { selectedLineIdx, lines } = meme;

    if (selectedLineIdx === null || selectedLineIdx < 0 || !lines[selectedLineIdx].isDrag) return;

    const pos = getEvPos(ev);
    const dx = pos.x - gStartPos.x;
    const dy = pos.y - gStartPos.y;

    moveLine(dx, dy);
    gStartPos = pos;
    renderMeme();
}

function onUp() {
    setLineDrag(false)
    document.body.style.cursor = 'default'
}

/* -------- LINES ACTIONS -------- */

function onUpdateText(elInput) {
    const inputValue = elInput.value
    updateText(inputValue)
    renderText()

    updateEditorFields()
    renderMeme()
}

function onSwitchLine() {
    switchLine()
    renderText()

    updateEditorFields()
    renderMeme()
}

function onAddLine() {
    addLine()
    renderText()

    updateEditorFields()
    renderMeme()
}

function onRemoveLine() {
    removeLine()
    renderText()

    updateEditorFields()
    renderMeme()
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
    renderMeme()
}

function onSelectFillColor(input) {
    const color = input.value

    changefillColor(color)
    renderMeme()
}

function onChangeFont() {
    const selectedFont = document.querySelector('.fonts.select').value
    changeFont(selectedFont)
    renderText()
}

/* -------- MEME SAVE/SHARE ACTIONS -------- */

function onShareImg() {
    const imgUrl = gElCanvas.toDataURL('image/jpeg')

    uploadImg(imgUrl, (imgUrl) => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imgUrl)}`
        window.open(shareUrl, '_blank')
    })
}

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
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    const elInput = document.querySelector('.text-input')
    const elStrokeBtn = document.querySelector('.stroke-clr-btn')
    const elFillBtn = document.querySelector('.fill-clr-btn')
    const elFontSelect = document.querySelector('.fonts')

    if (isReset || !lines || lines.length === 0) {
        elInput.value = ''
        elStrokeBtn.style.backgroundColor = '#F0F0F0'
        elFillBtn.style.backgroundColor = '#F0F0F0'
        elFontSelect.value = 'Arial'
    } else {
        const selectedLine = lines[selectedLineIdx]
        elInput.value = (selectedLine.txt === 'Add text here..') ? '' : selectedLine.txt
        elStrokeBtn.style.backgroundColor = selectedLine.stroke
        elFillBtn.style.backgroundColor = selectedLine.fill
        elFontSelect.value = selectedLine.font
    }
}
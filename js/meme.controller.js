'use strict'

// Canvas variables
let gElCanvas
let gCtx
let gCurrentMeme = null

// Text variables
let gTextSizeInterval

// Lines variables
let gStartPos
const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

// Helpers
let gRemoveBorderText = false


/* -------- EDITOR -------- */

function renderMeme() {
    const meme = getMeme()
    const memesImgs = getMemesImgs()

    gElCanvas = document.querySelector('canvas.meme')
    gCtx = gElCanvas.getContext('2d')

    const selectedImg = memesImgs.find(img => img.id === meme.selectedImgId) || { url: meme.imgUrl }
    gCurrentMeme = new Image()
    gCurrentMeme.src = selectedImg.url

    gCurrentMeme.onload = () => {
        coverCanvasWithImg(gCurrentMeme)
        renderLine()
        addLinsteners()
        if (!meme.lines) updateEditorFields(true)
        else updateEditorFields()
    }
}

function coverCanvasWithImg(img) {
    const imgRatio = img.naturalWidth / img.naturalHeight

    if (gElCanvas.width / gElCanvas.height > imgRatio) {
        gElCanvas.height = gElCanvas.width / imgRatio
    } else {
        gElCanvas.width = gElCanvas.height * imgRatio
    }

    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}

function renderLine() {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!meme || !lines || lines.length === 0) return

    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)

    if (gCurrentMeme) coverCanvasWithImg(gCurrentMeme)

    lines.forEach((line, idx) => {
        drawText(line, idx, selectedLineIdx)
    })
}

function drawText(line, idx = null, selectedLineIdx) {
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

    if (!gRemoveBorderText && idx === selectedLineIdx) {
        const textWidth = gCtx.measureText(txt).width
        gCtx.strokeStyle = stroke
        gCtx.lineWidth = 2
        gCtx.strokeRect(
            xPos - textWidth / 2 - 5,
            yPos - size,
            textWidth + 10,
            size + 10
        )
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

/* -------- LINES MOVMENTS -------- */

function addLinsteners() {
    addMouseListeners()
    addTouchListeners()
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

function getEvPos(ev) {
    const rect = gElCanvas.getBoundingClientRect()
    let pos = {
        x: (ev.clientX - rect.left) * (gElCanvas.width / rect.width),
        y: (ev.clientY - rect.top) * (gElCanvas.height / rect.height),
    }

    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: (ev.pageX - rect.left) * (gElCanvas.width / rect.width),
            y: (ev.pageY - rect.top) * (gElCanvas.height / rect.height),
        }
    }
    return pos
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
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (selectedLineIdx === null || selectedLineIdx < 0 || !lines[selectedLineIdx].isDrag) return

    const pos = getEvPos(ev)
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y

    moveLine(dx, dy)
    gStartPos = pos
    renderMeme()
}

function onUp() {
    setLineDrag(false)
    document.body.style.cursor = 'default'
}

/* -------- LINES ACTIONS -------- */

function onUpdateText(elInput) {
    const inputValue = elInput.value
    updateText(inputValue)
    renderLine()

    updateEditorFields()
    renderMeme()
}

function onSwitchLine() {
    switchLine()
    renderLine()

    updateEditorFields()
    renderMeme()
}

function onAddLine() {
    const xPos = gElCanvas.width / 2
    const yPos = gElCanvas.height / 2

    addLine(xPos, yPos)
    renderLine()

    updateEditorFields()
    renderMeme()
}

function onRemoveLine() {
    removeLine()
    renderLine()

    updateEditorFields()
    renderMeme()
}

/* -------- FONT TYPOGRAPGY ACTIONS -------- */

function onChangeTextSizeOnce(diff) {
    changeTextSize(diff)
    renderLine()
}

function startChangeTextSize(diff) {
    gTextSizeInterval = setInterval(() => {
        changeTextSize(diff)
        renderLine()
    }, 70)
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
    renderLine()
}

/* -------- MEME SAVE/SHARE ACTIONS -------- */

function onSaveMeme() {
    gRemoveBorderText = true
    renderMeme()

    setTimeout(() => {
        const imgUrl = gElCanvas.toDataURL('image/jpeg')
        saveMeme(imgUrl)
        renderSavedMemes()
        onChangeLayout('saved')
        gRemoveBorderText = false
    }, 0)
}

function onShareMeme() {
    gRemoveBorderText = true
    renderMeme()

    setTimeout(() => {
        const imgUrl = gElCanvas.toDataURL('image/jpeg')
        uploadImg(imgUrl, (uploadedImgUrl) => {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(uploadedImgUrl)}`
            window.open(shareUrl, '_blank')
            gRemoveBorderText = false
        })
    }, 0)
}

function onDownloadMeme(elLink) {
    gRemoveBorderText = true
    renderMeme()

    setTimeout(() => {
        const imgUrl = gElCanvas.toDataURL('image/jpeg')
        elLink.href = imgUrl
        gRemoveBorderText = false
    }, 0)
}

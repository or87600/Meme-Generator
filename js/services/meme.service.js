'use strict'

const STORAGE_KEY = 'meme_data'

const gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['politics'] },
    { id: 2, url: 'img/2.jpg', keywords: ['cute'] },
    { id: 3, url: 'img/3.jpg', keywords: ['cute', 'animals'] },
    { id: 4, url: 'img/4.jpg', keywords: ['cute', 'animals'] },
    { id: 5, url: 'img/5.jpg', keywords: ['funny'] },
    { id: 6, url: 'img/6.jpg', keywords: ['reaction'] },
    { id: 7, url: 'img/7.jpg', keywords: ['baby'] },
    { id: 8, url: 'img/8.jpg', keywords: ['classic'] },
    { id: 9, url: 'img/9.jpg', keywords: ['baby', 'laughing'] },
    { id: 10, url: 'img/10.jpg', keywords: ['laughing'] },
    { id: 11, url: 'img/11.jpg', keywords: ['sports'] },
    { id: 12, url: 'img/12.jpg', keywords: ['serious'] },
    { id: 13, url: 'img/13.jpg', keywords: ['celebration'] },
    { id: 14, url: 'img/14.jpg', keywords: ['funny'] },
    { id: 15, url: 'img/15.jpg', keywords: ['serious', 'classic'] },
    { id: 16, url: 'img/16.jpg', keywords: ['laughing', 'reaction'] },
    { id: 17, url: 'img/17.jpg', keywords: ['politics', 'serious'] },
    { id: 18, url: 'img/18.jpg', keywords: ['reaction'] },
    { id: 19, url: 'img/19.jpg', keywords: ['reaction'] },
    { id: 20, url: 'img/20.jpg', keywords: ['funny'] },
    { id: 21, url: 'img/21.jpg', keywords: ['reaction'] },
    { id: 22, url: 'img/22.jpg', keywords: ['funny', 'celebration'] },
    { id: 23, url: 'img/23.jpg', keywords: ['funny', 'laughing'] },
    { id: 24, url: 'img/24.jpg', keywords: ['cute'] },
    { id: 25, url: 'img/25.jpg', keywords: ['reaction', 'celebration'] },
]

var gMeme = {
    selectedImgId: null,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'Add text here..',
            size: 30,
            font: 'Arial',
            fill: '#FFFFFF',
            stroke: '#FF8800',
        }
    ]
}

function getMemesImgs() {
    return gImgs
}

function getMeme() {
    _saveMeme()
    return gMeme
}

/* -------- LINES ACTIONS -------- */

function switchLine() {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!lines || lines.length === 0) return

    if (selectedLineIdx === undefined || selectedLineIdx === lines.length - 1) {
        meme.selectedLineIdx = 0
    } else {
        meme.selectedLineIdx++
    }

    saveToStorage(STORAGE_KEY, meme)
}

function addLine() {
    const meme = getMeme()

    const newLine = {
        txt: 'Add text here..',
        size: 30,
        font: 'Arial',
        fill: '#FFFFFF',
        stroke: '#FF8800',
    }

    meme.lines.push(newLine)

    if (meme.selectedLineIdx === null) {
        meme.selectedLineIdx = 0
    } else {
        meme.selectedLineIdx++
    }

    _saveMeme()
}

function removeLine() {
    const meme = getMeme()
    let { selectedLineIdx, lines } = meme

    if (!lines || lines.length === 0) return

    lines.splice(selectedLineIdx, 1)

    if (lines.length > 0) {
        if (selectedLineIdx === lines.length) {
            meme.selectedLineIdx = selectedLineIdx - 1
        }
    } else {
        meme.selectedLineIdx = null
    }

    _saveMeme()
}

/* -------- FONT TYPOGRAPGY ACTIONS -------- */

function updateText(value) {
    const meme = getMeme()
    const selectedLine = meme.lines[meme.selectedLineIdx]

    if (!meme.lines || meme.lines.length === 0) return

    selectedLine.txt = value
    _saveMeme()
}

function changeTextSize(diff) {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!lines || lines.length === 0) return

    const newSize = lines[selectedLineIdx].size + diff
    if (newSize >= 10 && newSize <= 50) lines[selectedLineIdx].size = newSize

    _saveMeme()
}

function changeStrokeColor(color) {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!lines || lines.length === 0) return
    lines[selectedLineIdx].stroke = color

    _saveMeme()
}

function changefillColor(color) {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!lines || lines.length === 0) return
    lines[selectedLineIdx].fill = color

    _saveMeme()
}

function changeFont(selectedFont) {
    const meme = getMeme()
    const { selectedLineIdx, lines } = meme

    if (!lines || lines.length === 0) return
    lines[selectedLineIdx].font = selectedFont

    _saveMeme()
}

/* -------- MEME SAVE/SHARE ACTIONSv -------- */

async function uploadImg(imgData, onSuccess) {
    const CLOUD_NAME = 'webify'
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const formData = new FormData()
    formData.append('file', imgData)
    formData.append('upload_preset', 'webify')
    try {
        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        })
        const data = await res.json()
        console.log('Cloudinary response:', data)
        onSuccess(data.secure_url)

    } catch (err) {
        console.log(err)
    }
}

/* -------- LOCAL FUNCTIONS -------- */

function _saveMeme() {
    saveToStorage(STORAGE_KEY, gMeme)
}
import { setBody, checkisSolution } from './helper.js'

setBody()

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const movesBlock = document.getElementById('moves')
const timeBlock = document.getElementById('time')
const start = document.querySelector('#start')
const pause = document.querySelector('#stop')
const frameSize = document.querySelector('#sizeBoard')
const options = document.querySelectorAll('.options')
const volume = document.querySelector('.volume')
const resultsBtn = document.querySelector('#results')
const moveAudio = new Audio('./assets/move.mp3')
moveAudio.volume = 0.5
let canvasHalf = 200

if (window.innerWidth <= 340) {
    canvas.width = 280
    canvas.height = 280
    canvasHalf = 140
} else if (window.innerWidth <= 768) {
    canvas.width = 320
    canvas.height = 320
    canvasHalf = 160
} else {
    canvas.width = 400
    canvas.height = 400
    canvasHalf = 200
}

window.addEventListener('resize', () => {
    if (window.innerWidth <= 340) {
        canvas.width = 280
        canvas.height = 280
        canvasHalf = 140
    } else if (window.innerWidth <= 768) {
        canvas.width = 320
        canvas.height = 320
        canvasHalf = 160
    } else {
        canvas.width = 400
        canvas.height = 400
        canvasHalf = 200
    }
    changeSize()
})

function resize(num) {
    if (window.innerWidth <= 340) {
        return 280 / num
    } else if (window.innerWidth <= 768) {
        return 320 / num
    } else {
        return 400 / num
    }
}

let cellCount = 4
let playField = [], gameWinResult = [], coords = []
let isPaused = true
let hoveredItem = null
let gameOver = false
let isOver = false
let moves = 0, time = 0

let results = {
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: []
}

function changeSize() {
    coords.forEach(element => {
        element.x = element.col * resize(cellCount)
        element.y = element.row * resize(cellCount)
    })
}

//                                                          --------  Hover   -------

function stillOnHovered(X, Y) {
    return hoveredItem && (X > hoveredItem.x) && (X < hoveredItem.x + resize(cellCount)) && (Y > hoveredItem.y) && (Y < hoveredItem.y + resize(cellCount))
}

function getHoveredItem(X, Y) {
    return coords.find((coord) => {
        return (X > coord.x) && (X < coord.x + resize(cellCount)) && (Y > coord.y) && (Y < coord.y + resize(cellCount))
    })
}

canvas.addEventListener('mousemove', (e) => {
    const X = e.offsetX
    const Y = e.offsetY

    if (stillOnHovered(X, Y)) {
        return
    }
    hoveredItem = getHoveredItem(X, Y)
})

canvas.addEventListener('mouseout', () => {
    hoveredItem = null
})

canvas.addEventListener('click', e => {
    const X = e.offsetX
    const Y = e.offsetY

    if (stillOnHovered(X, Y)) {
        if (isPaused) {
            isPaused = false
            pause.classList.remove('pause-active')
        }

        const emptyCell = (
            playField[hoveredItem.row] && playField[hoveredItem.row][hoveredItem.col + 1] === 0 && { row: hoveredItem.row, col: hoveredItem.col + 1 } ||
            playField[hoveredItem.row] && playField[hoveredItem.row][hoveredItem.col - 1] === 0 && { row: hoveredItem.row, col: hoveredItem.col - 1 } ||
            playField[hoveredItem.row - 1] && playField[hoveredItem.row - 1][hoveredItem.col] === 0 && { row: hoveredItem.row - 1, col: hoveredItem.col } ||
            playField[hoveredItem.row + 1] && playField[hoveredItem.row + 1][hoveredItem.col] === 0 && { row: hoveredItem.row + 1, col: hoveredItem.col }
        )

        if (emptyCell) {
            const currentN = playField[hoveredItem.row][hoveredItem.col]
            playField[hoveredItem.row][hoveredItem.col] = 0
            playField[emptyCell.row][emptyCell.col] = currentN
            hoveredItem = null
            moves++
            movesBlock.innerHTML = `<h3>Moves: ${moves}<h3>`
            gameOver = checkWin()
            moveAudio.play()
        }
    }
})

//                                         ----  INIT ---

function initField() {
    const existedNumbers = []
    let counter = 1
    for (let i = 0; i < cellCount; i++) {
        const row = [], winRow = []
        for (let j = 0; j < cellCount; j++) {
            while (row.length !== cellCount) {
                const n = Math.floor(Math.random() * (cellCount * cellCount))
                if (!existedNumbers.includes(n)) {
                    existedNumbers.push(n)
                    row.push(n)
                }
            }
            coords.push({ row: i, col: j, x: j * resize(cellCount), y: i * resize(cellCount) })
            winRow.push(counter)
            counter++
        }
        gameWinResult.push(winRow)
        playField.push(row)
    }
    if (!checkisSolution(playField, cellCount)) {
        startGame()
    }
    gameWinResult[gameWinResult.length - 1][cellCount - 1] = 0
}

//                                  -----  Draw Playfield ----

function drawPlayField() {
    let sellWidth = resize(cellCount)
    if (isPaused) {
        pause.classList.add('pause-active')
    } else {
        pause.classList.remove('pause-active')
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (gameOver) {
        if (!isOver) {
            isOver = true
            isOver = results[cellCount].push([time, moves])
        }
        gameOverScreen()
    } else {
        for (let row = 0; row < playField.length; row++) {
            for (let col = 0; col < playField[row].length; col++) {
                const X = col * sellWidth
                const Y = row * sellWidth
                if (playField[row][col]) {
                    ctx.beginPath()
                    if (hoveredItem && hoveredItem.x === X && hoveredItem.y === Y) {
                        ctx.fillStyle = '#998249'
                    } else {
                        ctx.fillStyle = '#d4cfa7'
                    }
                    ctx.rect(X, Y, sellWidth, sellWidth)
                    ctx.fill()
                    ctx.strokeStyle = 'black'
                    ctx.stroke()
                    ctx.font = `${canvas.width / 10}px monospace`
                    ctx.fillStyle = 'black'
                    ctx.textAlign = 'left'
                    ctx.textBaseline = 'top'

                    const txt = playField[row][col]
                    const measuredText = ctx.measureText(txt)
                    const offset = sellWidth - measuredText.width
                    ctx.fillText(playField[row][col], X + offset / 2, Y + sellWidth / cellCount)
                }
            }
        }
    }
}

function drawBoard() {
    setInterval(drawPlayField, 50)
}

initField()
drawBoard()

//                                                      ---  Game Over -----

function checkWin() {
    for (let row = 0; row < playField.length; row++) {
        for (let col = 0; col < playField[row].length; col++) {
            if (playField[row][col] !== gameWinResult[row][col]) {
                return false
            }
        }
    }
    return true
}

function gameOverScreen() {
    isPaused = true
    playField = [], gameWinResult = [], coords = []
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = '20px monospace'
    ctx.textBaseline = 'center'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(`Ура!`, canvasHalf, canvasHalf - 30)

    ctx.font = '20px monospace'
    ctx.textBaseline = 'center'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(`Вы решили головоломку за`, canvasHalf, canvasHalf)

    ctx.font = '20px monospace'
    ctx.textBaseline = 'center'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(`${timeFormat(time)} и ${moves} ходов!`, canvasHalf, canvasHalf + 30)
}

//                                                  ----- Controls -----

function startGame() {
    isOver = false
    playField = []
    gameWinResult = []
    coords = []
    hoveredItem = null
    gameOver = false
    moves = 0
    time = 0
    isPaused = true
    initField()
    timeBlock.innerHTML = `<h3>Time: ${timeFormat(time)}</h3>`
    movesBlock.innerHTML = `<h3>Moves: ${moves}<h3>`
}

function pauseGame() {
    if (isPaused) {
        isPaused = false
        pause.classList.remove('pause-active')
    } else {
        isPaused = true
        pause.classList.add('pause-active')
    }
}

//                                                  -----  Time -----

function timeFormat(time) {
    let min = 0
    let sec = 0
    if (time >= 60) {
        min = Math.floor(time / 60)
        sec = time % 60
    } else {
        sec = time
    }
    let str = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
    return str
}

let t = window.setInterval(() => {
    if (!isPaused) {
        time++
    }
    timeBlock.innerHTML = `<h3>Time: ${timeFormat(time)}</h3>`
    movesBlock.innerHTML = `<h3>Moves: ${moves}<h3>`
}, 1000)

start.addEventListener('click', startGame)
pause.addEventListener('click', pauseGame)
frameSize.addEventListener('change', () => {
    cellCount = +frameSize.value
    startGame()
})

//                               -                          -- Volume ---

volume.addEventListener('click', () => {
    if (moveAudio.volume > 0) {
        moveAudio.volume = 0
        volume.classList.remove('volume')
        volume.classList.add('mute')
    } else {
        moveAudio.volume = 0.5
        volume.classList.remove('mute')
        volume.classList.add('volume')
    }
})

//                                                  --- Results ---

resultsBtn.addEventListener('click', () => {
    isPaused = true
    document.querySelector('.bestResults').style.display = 'flex'
    let list = document.querySelector('.resultsList')
    list.innerHTML = ''
    Object.keys(results).forEach(el => {
        if (el !== 'undefined') {
            let item = document.createElement('li')
            item.innerHTML = `${el} x ${el}`
            item.addEventListener('click', () => {
                chooseFrame(Number(el))
            })
            list.append(item)
        }
    })

    function chooseFrame(value) {
        let list = document.querySelector('.resultsList')
        list.innerHTML = ''
        let theBestResults = []
        if (results[value].length === 0) {
            list.innerHTML = 'Empty'
            theBestResults = []
        } else {
            theBestResults = results[value].sort((a, b) => a[1] - b[1]).slice(0, 10)
        }
        theBestResults.forEach((el, id) => {
            let item = document.createElement('li')
            item.innerHTML = `${id + 1}. ${timeFormat(el[0])} и ${el[1]} ходов.`
            list.append(item)
        })
        results[value] = theBestResults
        theBestResults = []
    }
})

document.querySelector('.bestResults').addEventListener('click', (e) => {
    if (e.target.classList.contains('bestResults')) {
        document.querySelector('.bestResults').style.display = 'none'
    }
})

//                                    --- Local Storage ---

function setLocalStorage() {
    const initObj = {
        cellCount: cellCount,
        playField: playField,
        gameWinResult: gameWinResult,
        coords: coords,
        gameOver: gameOver,
        hoveredItem: hoveredItem,
        moves: moves,
        time: time,
    }
    localStorage.setItem('initObj', JSON.stringify(initObj))
}

window.addEventListener('unload', () => {
    localStorage.setItem('resultsObj', JSON.stringify(results))
})

function getLocalStorage() {
    if (localStorage.getItem('initObj')) {
        let localSettings = JSON.parse(localStorage.getItem('initObj'))
        cellCount = localSettings.cellCount
        playField = localSettings.playField
        gameWinResult = localSettings.gameWinResult
        coords = localSettings.coords
        isPaused = true
        gameOver = localSettings.gameOver
        hoveredItem = localSettings.hoveredItem
        moves = localSettings.moves
        time = localSettings.time
        timeBlock.innerHTML = `<h3>Time: ${timeFormat(time)}</h3>`
        movesBlock.innerHTML = `<h3>Moves: ${moves}<h3>`
        selectOption(options)
        changeSize()
    }
    if (localStorage.getItem('resultsObj')) {
        results = JSON.parse(localStorage.getItem('resultsObj'))
    }
}
window.addEventListener('load', getLocalStorage)

document.querySelector('#save').addEventListener('click', setLocalStorage)

function selectOption(options) {
    options.forEach(el => {
        if (+el.value == cellCount) {
            frameSize.value = +el.value
        }
    })
}

export const setBody = () => {
    document.body.insertAdjacentHTML("afterbegin", `
<div class="bestResults">
        <ul class="resultsList"></ul>
    </div>
<div div class="game-environment" >
    <div class='game-controls'>
        <button id="start">Shuffle</button>
        <button id="stop">Pause</button>
        <button id="save">Save</button>
        <button id="results">Results</button>
    </div>
    <div class='game-stats'>
        <div id="time">
            <h3>Time: 00:00 </h3>
        </div>
        <div id="moves">
            <h3>Moves: 0</h3>
        </div>
    </div>  
</div>
<canvas></canvas>
<div class="bottomNav">
    <div class="currentSize">Frame size: </div>
    <select name="sizeBoard" id="sizeBoard" size="1" required>
        <option class='options' value="3">3x3</option>
        <option class='options' value="4" selected>4x4</option>
        <option class='options' value="5">5x5</option>
        <option class='options' value="6">6x6</option>
        <option class='options' value="7">7x7</option>
        <option class='options' value="8">8x8</option>
    </select>
    <div class="sound volume"></div>
</div>
`)
}

export const checkisSolution = (playField, cellCount) => {
    let queue = []
    let invers = 0
    let zeroRow = 0

    for (let row = 0; row < playField.length; row++) {
        for (let col = 0; col < playField[row].length; col++) {
            if (playField[row][col] === 0) {
                zeroRow = row
            } else {
                let item = playField[row][col]
                queue.push(item)
            }
        }
    }

    for (let i = 0; i < queue.length - 1; i++) {
        let cur = queue[i]
        let nextNums = queue.slice(i + 1, queue.length)

        for (let j = 0; j < nextNums.length; j++) {
            if (nextNums[j] < cur) {
                invers++
            }
        }
    }
    let sum = invers + zeroRow

    if (cellCount % 2 === 0) {
        if (sum % 2 == 0) {
            return false
        } else {
            return true
        }
    }
    if (cellCount % 2 !== 0) {
        if (sum % 2 == 0) {
            return true
        } else {
            return false
        }
    }
}
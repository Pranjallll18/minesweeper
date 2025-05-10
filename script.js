$(document).ready(function () {
    let rows, cols, minesCount;
    let minefield = [];
    let flagsCount = 0;
    let timer = 0;
    let gameInterval;
    let gameOver = false;

    const clickSound = document.getElementById("click-sound");
    const explosionSound = document.getElementById("explosion-sound");
    const winSound = document.getElementById("win-sound");

    function applyDifficulty() {
        const difficulty = $('#difficulty').val();
        if (difficulty === 'easy') {
            $('#size').val(8);
            $('#mines').val(10);
        } else if (difficulty === 'medium') {
            $('#size').val(12);
            $('#mines').val(25);
        } else if (difficulty === 'hard') {
            $('#size').val(16);
            $('#mines').val(50);
        }
    }

    $('#difficulty').on('change', applyDifficulty);

    function initializeGame() {
        clearInterval(gameInterval);
        $('#timer').text('Time: 0s');
        $('#flags').text('Flags: 0');
        flagsCount = 0;
        timer = 0;
        gameOver = false;
        $('#message').text('').removeClass('game-over win');

        rows = parseInt($('#size').val());
        cols = rows;
        minesCount = parseInt($('#mines').val());
        minefield = Array(rows).fill().map(() => Array(cols).fill(0));

        $('#minefield').css('grid-template-columns', `repeat(${cols}, 40px)`);
        generateMinefield();
        console.log(minefield);

        renderMinefield();

        gameInterval = setInterval(() => {
            timer++;
            $('#timer').text(`Time: ${timer}s`);
        }, 1000);
    }

    function generateMinefield() {
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            let row = Math.floor(Math.random() * rows);
            let col = Math.floor(Math.random() * cols);
            if (minefield[row][col] === 0) {
                minefield[row][col] = 'M';
                minesPlaced++;
            }
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (minefield[r][c] !== 'M') {
                    minefield[r][c] = countAdjacentMines(r, c);
                }
            }
        }
    }

    function countAdjacentMines(row, col) {
        let count = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (row + r >= 0 && row + r < rows && col + c >= 0 && col + c < cols) {
                    if (minefield[row + r][col + c] === 'M') {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function renderMinefield() {
        $('#minefield').empty();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cell = $('<div class="cell"></div>').data('row', r).data('col', c);
                $('#minefield').append(cell);
            }
        }

        $('.cell').on('click', function () {
            if (gameOver) return;
            clickSound.play();
            let row = $(this).data('row');
            let col = $(this).data('col');
            revealCell(row, col);
            checkWinCondition();
        });

        $('.cell').on('contextmenu', function (e) {
            e.preventDefault();
            if (gameOver) return;
            let row = $(this).data('row');
            let col = $(this).data('col');
            toggleFlag(row, col);
            checkWinCondition();
        });
    }

    function revealCell(row, col) {
        let cell = $(`.cell[data-row=${row}][data-col=${col}]`);
        if (cell.hasClass('revealed') || cell.hasClass('flag')) {
            return;
        }
        console.log(`Clicked: [${row}, ${col}] → Value: ${minefield[row][col]}`);


        cell.addClass('revealed');

        if (minefield[row][col] === 'M') {
            cell.addClass('mine').text('💣');
            gameOver = true;
            clearInterval(gameInterval);
            explosionSound.play();
            revealAllMines();
            $('#message').text('Game Over!').addClass('game-over');
        } else {
            cell.addClass('safe').text(minefield[row][col] === 0 ? '💎' : minefield[row][col]);
            if (minefield[row][col] === 0) {
                revealAdjacentCells(row, col);
            }
        }
    }

    function toggleFlag(row, col) {
        let cell = $(`.cell[data-row=${row}][data-col=${col}]`);
        if (cell.hasClass('revealed')) {
            return;
        }

        if (cell.hasClass('flag')) {
            cell.removeClass('flag').text('');
            flagsCount--;
        } else if (flagsCount < minesCount) {
            cell.addClass('flag').text('🚩');
            flagsCount++;
        }
        $('#flags').text(`Flags: ${flagsCount}`);
    }

    function revealAdjacentCells(row, col) {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (row + r >= 0 && row + r < rows && col + c >= 0 && col + c < cols) {
                    let neighbor = $(`.cell[data-row=${row + r}][data-col=${col + c}]`);
                    if (!neighbor.hasClass('revealed') && !neighbor.hasClass('flag')) {
                        revealCell(row + r, col + c);
                    }
                }
            }
        }
    }

    function revealAllMines() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (minefield[r][c] === 'M') {
                    $(`.cell[data-row=${r}][data-col=${c}]`).addClass('mine').text('💣');
                }
            }
        }
    }

    function checkWinCondition() {
        let revealedCells = $('.cell.revealed').length;
        if (revealedCells === (rows * cols - minesCount)) {
            clearInterval(gameInterval);
            gameOver = true;
            $('#message').text('You Win! 🎉').removeClass('game-over').addClass('win');
            winSound.play();
            revealAllMines();
        }
    }

    $('#start').on('click', function () {
        initializeGame();
    });

    $('#reset').on('click', function () {
        initializeGame();
    });

    applyDifficulty();
    initializeGame();
});

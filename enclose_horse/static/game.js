const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 10;
const CELL_SIZE = canvas.width / GRID_SIZE;

const MAX_WALLS = 14;
let usedWalls = 0;

let grid = [];
let ponds = [];
let horse = null;
let currentLevel = 1;


// -------------------------
// INITIALISATION DE LA GRILLE
// -------------------------
function initGrid() {
    grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        let row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            row.push({
                hasWall: false
            });
        }
        grid.push(row);
    }

    generateLevel();
    updateWallCounter();
}


// -------------------------
// NIVEAUX (plus de ponds pour difficulté)
// -------------------------
function generateLevel() {

    if (currentLevel === 1) {
        ponds = [
            { x: 3, y: 3 },
            { x: 4, y: 3 },
            { x: 3, y: 4 }
        ];
        horse = { x: 6, y: 6 };
    }

    if (currentLevel === 2) {
        ponds = [
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 4, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 4 },
            { x: 5, y: 5 },
            { x: 6, y: 5 }
        ];
        horse = { x: 7, y: 7 };
    }

    if (currentLevel === 3) {
        ponds = [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 5, y: 5 },
            { x: 6, y: 5 }
        ];
        horse = { x: 4, y: 7 };
    }
}


// -------------------------
// AFFICHAGE
// -------------------------
function updateWallCounter() {
    document.getElementById("walls").textContent = `Walls: ${usedWalls}/${MAX_WALLS}`;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grille
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(canvas.width, y * CELL_SIZE);
        ctx.stroke();
    }

    // Ponds (bleus)
    ponds.forEach(p => {
        ctx.fillStyle = "#4aa3ff";
        ctx.fillRect(
            p.x * CELL_SIZE,
            p.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    });

    // Cheval (blanc)
    if (horse) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
            horse.x * CELL_SIZE + CELL_SIZE / 2,
            horse.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Murs (carrés noirs)
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x].hasWall) {
                ctx.fillStyle = "black";
                ctx.fillRect(
                    x * CELL_SIZE + CELL_SIZE / 4,
                    y * CELL_SIZE + CELL_SIZE / 4,
                    CELL_SIZE / 2,
                    CELL_SIZE / 2
                );
            }
        }
    }
}


// -------------------------
// CLIC SUR UNE CASE = MUR
// -------------------------
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x = Math.floor(mouseX / CELL_SIZE);
    const y = Math.floor(mouseY / CELL_SIZE);

    const cell = grid[y][x];

    if (!cell.hasWall) {
        if (usedWalls >= MAX_WALLS) return;
        cell.hasWall = true;
        usedWalls++;
    } else {
        cell.hasWall = false;
        usedWalls--;
    }

    updateWallCounter();
    drawGrid();
});


// -------------------------
// FLOOD FILL (extérieur)
// -------------------------
function floodFill() {
    let visited = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(false)
    );

    let queue = [{ x: 0, y: 0 }];
    visited[0][0] = true;

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        if (grid[y][x].hasWall) continue;

        if (y > 0 && !visited[y - 1][x] && !grid[y - 1][x].hasWall) {
            visited[y - 1][x] = true;
            queue.push({ x, y: y - 1 });
        }

        if (y < GRID_SIZE - 1 && !visited[y + 1][x] && !grid[y + 1][x].hasWall) {
            visited[y + 1][x] = true;
            queue.push({ x, y: y + 1 });
        }

        if (x > 0 && !visited[y][x - 1] && !grid[y][x - 1].hasWall) {
            visited[y][x - 1] = true;
            queue.push({ x: x - 1, y });
        }

        if (x < GRID_SIZE - 1 && !visited[y][x + 1] && !grid[y][x + 1].hasWall) {
            visited[y][x + 1] = true;
            queue.push({ x: x + 1, y });
        }
    }

    return visited;
}


// -------------------------
// CONDITION DE VICTOIRE
// -------------------------
function isHorseEnclosed() {
    const visited = floodFill();
    return !visited[horse.y][horse.x];
}


// -------------------------
// SUBMIT
// -------------------------
document.getElementById("submitBtn").addEventListener("click", () => {
    const horseOK = isHorseEnclosed();

    if (horseOK) {
        alert("Bravo ! Tu as enfermé le cheval !");
        currentLevel++;
        if (currentLevel > 3) currentLevel = 1;
        resetGame();
    } else {
        alert("Le cheval n'est pas encore enfermé.");
    }
});


// -------------------------
// RESET
// -------------------------
document.getElementById("resetBtn").addEventListener("click", () => {
    resetGame();
});

function resetGame() {
    usedWalls = 0;
    initGrid();
    drawGrid();
}


// -------------------------
initGrid();
drawGrid();

let map = [];
let width = 0;
let height = 0;
let spriteMap = {};

// Function to initialize the map
function initializeMap(newWidth, newHeight) {
    width = newWidth;
    height = newHeight;
    map = Array.from({ length: height }, () => Array(width).fill(0));
    renderGrid();
}

// Function to render the grid (updated to include sprites)
function renderGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Clear existing grid
    for (let y = 0; y < height; y++) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        for (let x = 0; x < width; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            const value = map[y][x];
            if (spriteMap[value]) {
                const img = document.createElement('img');
                img.src = spriteMap[value];
                img.alt = value;
                img.style.width = '100%';
                img.style.height = '100%';
                cell.appendChild(img);
            } else {
                cell.textContent = value;
            }
            cell.dataset.x = x;
            cell.dataset.y = y;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = map[y][x];
            input.style.width = '100%';
            input.style.height = '100%';
            input.addEventListener('change', (event) => {
                const newValue = parseInt(event.target.value, 10);
                if (!isNaN(newValue)) {
                    map[y][x] = newValue;
                    renderGrid();
                }
            });
            cell.appendChild(input);
            row.appendChild(cell);
        }
        gridContainer.appendChild(row);
    }
}

// Function to set a tile to a specific number
function setTile(x, y) {
    const newValue = prompt(`Set value for tile (${x}, ${y}):`, map[y][x]);
    if (newValue !== null && !isNaN(newValue)) {
        map[y][x] = Number(newValue);
        renderGrid();
    }
}

// Function to update sprite mappings
function updateSpriteMapping() {
    const spriteTable = document.getElementById('sprite-table');
    spriteMap = {};
    Array.from(spriteTable.rows).forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const number = row.cells[0].querySelector('input').value;
        const url = row.cells[1].querySelector('input').value;
        if (number && url) {
            spriteMap[Number(number)] = url;
        }
    });
    renderGrid();
}

// Attach event listener to initialize button
document.getElementById('initialize-button').addEventListener('click', () => {
    const newWidth = parseInt(document.getElementById('map-width').value, 10);
    const newHeight = parseInt(document.getElementById('map-height').value, 10);
    if (!isNaN(newWidth) && !isNaN(newHeight)) {
        initializeMap(newWidth, newHeight);
    } else {
        alert('Please enter valid numbers for width and height.');
    }
});

// Attach event listener to update sprite mappings
document.getElementById('update-sprites-button').addEventListener('click', updateSpriteMapping);

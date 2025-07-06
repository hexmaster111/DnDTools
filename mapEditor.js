let map = [];
let width = 0;
let height = 0;
let spriteMap = {};

// Function to initialize or resize the map
function initializeMap(newWidth, newHeight) {
    const newMap = Array.from({ length: newHeight }, (_, y) =>
        Array.from({ length: newWidth }, (_, x) => (map[y] && map[y][x] !== undefined ? map[y][x] : 0))
    );

    width = newWidth;
    height = newHeight;
    map = newMap;

    renderEditorGrid();
    renderPreviewGrid();
}

// Function to render the editor grid
function renderEditorGrid() {
    const editorContainer = document.getElementById('editor-grid');
    editorContainer.innerHTML = ''; // Clear existing grid
    for (let y = 0; y < height; y++) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        for (let x = 0; x < width; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            valueInput.value = map[y][x];
            valueInput.className = 'cell-input';
            valueInput.addEventListener('change', () => {
                map[y][x] = parseInt(valueInput.value, 10) || 0;
                renderPreviewGrid(); // Update preview grid
            });

            cell.appendChild(valueInput);
            row.appendChild(cell);
        }
        editorContainer.appendChild(row);
    }
}

// Function to render the preview grid on a canvas
function renderPreviewGrid() {
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size based on the grid size
    canvas.width = width * 32; // Assuming each tile is 32px wide
    canvas.height = height * 32; // Assuming each tile is 32px tall

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each tile on the canvas
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = map[y][x];
            if (spriteMap[value]) {
                const img = new Image();
                img.src = spriteMap[value];
                img.onload = () => {
                    ctx.drawImage(img, x * 32, y * 32, 32, 32);
                };
            } else {
                // Draw the number if no sprite is assigned
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value, x * 32 + 16, y * 32 + 16);
            }
        }
    }
}

// Function to handle sprite mapping updates
function updateSpriteMapping(event) {
    const rows = document.querySelectorAll('#sprite-table tbody tr');
    rows.forEach((row) => {
        const numberInput = row.querySelector('.sprite-number');
        const fileInput = row.querySelector('.sprite-file');
        const previewImg = row.querySelector('.sprite-preview');

        const number = parseInt(numberInput.value, 10);
        if (isNaN(number)) return;

        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const spriteData = event.target.result;
                spriteMap[number] = spriteData; // Save to spriteMap
                previewImg.src = spriteData; // Update preview image
                renderPreviewGrid(); // Update preview grid
            };
            reader.readAsDataURL(file);
        } else if (spriteMap[number]) {
            // If no file is uploaded but the number exists in the spriteMap, keep the existing mapping
            previewImg.src = spriteMap[number];
        }
    });
}

// Function to add a new row to the sprite mapping table
function addSpriteMappingRow() {
    const spriteTableBody = document.querySelector('#sprite-table tbody');
    const row = document.createElement('tr');

    const numberCell = document.createElement('td');
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.className = 'sprite-number';
    numberInput.placeholder = 'Enter number';
    numberCell.appendChild(numberInput);

    const fileCell = document.createElement('td');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.className = 'sprite-file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', updateSpriteMapping);
    fileCell.appendChild(fileInput);

    const previewCell = document.createElement('td');
    const previewImg = document.createElement('img');
    previewImg.className = 'sprite-preview';
    previewImg.src = '';
    previewImg.alt = 'Preview';
    previewImg.style.width = '32px';
    previewImg.style.height = '32px';
    previewCell.appendChild(previewImg);

    row.appendChild(numberCell);
    row.appendChild(fileCell);
    row.appendChild(previewCell);

    spriteTableBody.appendChild(row);
}

// Function to save the map and sprite mappings to a JSON file
function saveToJson() {
    const data = {
        map,
        spriteMap,
        width,
        height
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mapData.json';
    link.click();
}

// Function to load the map and sprite mappings from a JSON file
function loadFromJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.map && data.spriteMap && data.width && data.height) {
                map = data.map;
                spriteMap = data.spriteMap;
                width = data.width;
                height = data.height;

                // Populate the sprite mapping table
                const spriteTableBody = document.querySelector('#sprite-table tbody');
                spriteTableBody.innerHTML = ''; // Clear existing rows
                Object.entries(spriteMap).forEach(([number, imageUrl]) => {
                    const row = document.createElement('tr');

                    const numberCell = document.createElement('td');
                    const numberInput = document.createElement('input');
                    numberInput.type = 'number';
                    numberInput.className = 'sprite-number';
                    numberInput.value = number;
                    numberInput.readOnly = true; // Make it read-only since it's loaded
                    numberCell.appendChild(numberInput);

                    const fileCell = document.createElement('td');
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.className = 'sprite-file';
                    fileInput.accept = 'image/*';
                    fileInput.addEventListener('change', updateSpriteMapping);
                    fileCell.appendChild(fileInput);

                    const previewCell = document.createElement('td');
                    const previewImg = document.createElement('img');
                    previewImg.className = 'sprite-preview';
                    previewImg.src = imageUrl;
                    previewImg.alt = 'Preview';
                    previewImg.style.width = '32px';
                    previewImg.style.height = '32px';
                    previewCell.appendChild(previewImg);

                    row.appendChild(numberCell);
                    row.appendChild(fileCell);
                    row.appendChild(previewCell);

                    spriteTableBody.appendChild(row);
                });

                renderEditorGrid();
                renderPreviewGrid();
                alert('Map loaded successfully!');
            } else {
                alert('Invalid JSON file format.');
            }
        } catch (error) {
            alert('Error parsing JSON file.');
        }
    };
    reader.readAsText(file);
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

// Attach event listener to update sprite mappings button
document.getElementById('update-sprites-button').addEventListener('click', updateSpriteMapping);

// Attach event listener to the "Add Mapping" button
document.getElementById('add-mapping-button').addEventListener('click', addSpriteMappingRow);

// Attach event listeners to save and load buttons
document.getElementById('save-button').addEventListener('click', saveToJson);
document.getElementById('load-file').addEventListener('change', loadFromJson);

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const pixelCanvas = document.getElementById('pixelCanvas');
    const colorPicker = document.getElementById('colorPicker');
    const eraserBtn = document.getElementById('eraser');
    const pencilBtn = document.getElementById('pencil');
    const fillBtn = document.getElementById('fill');
    const clearBtn = document.getElementById('clear');
    const colorPresets = document.querySelectorAll('.color-preset');
    const currentColorPreview = document.getElementById('currentColorPreview');
    const currentColorCode = document.getElementById('currentColorCode');

    // State variables
    let currentColor = '#000000';
    let isDrawing = false;
    let isErasing = false;
    let isFilling = false;
    let currentTool = 'pencil';

    // Initialize UI
    updateColorDisplay(currentColor);
    pencilBtn.classList.add('active');

    // Create 16x16 pixel grid
    function createGrid() {
        for (let i = 0; i < 256; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixel.style.backgroundColor = 'white';
            pixelCanvas.appendChild(pixel);
        }
    }

    // Handle drawing logic
    function draw(pixel) {
        if (isErasing) {
            pixel.style.backgroundColor = 'white';
        } else {
            pixel.style.backgroundColor = currentColor;
        }
    }

    // Fill connected pixels of the same color
    function fill(targetPixel) {
        const targetColor = targetPixel.style.backgroundColor;
        const pixels = document.querySelectorAll('.pixel');
        const pixelArray = Array.from(pixels);

        // Convert to 2D grid for easier neighbor finding
        const grid = [];
        for (let i = 0; i < 16; i++) {
            grid.push(pixelArray.slice(i * 16, (i + 1) * 16));
        }

        // Get pixel position
        const pixelIndex = pixelArray.indexOf(targetPixel);
        const row = Math.floor(pixelIndex / 16);
        const col = pixelIndex % 16;

        // Flood fill algorithm
        function floodFill(r, c, targetColor, replacementColor) {
            // Check bounds
            if (r < 0 || r >= 16 || c < 0 || c >= 16) return;

            // Check if this pixel has the target color
            if (grid[r][c].style.backgroundColor !== targetColor) return;

            // Fill the pixel
            grid[r][c].style.backgroundColor = replacementColor;

            // Recursively fill neighbors
            floodFill(r + 1, c, targetColor, replacementColor);
            floodFill(r - 1, c, targetColor, replacementColor);
            floodFill(r, c + 1, targetColor, replacementColor);
            floodFill(r, c - 1, targetColor, replacementColor);
        }

        floodFill(row, col, targetColor, currentColor);
    }

    // Update color display in UI
    function updateColorDisplay(color) {
        currentColorPreview.style.backgroundColor = color;
        currentColorCode.textContent = color;
    }

    // Set active tool
    function setActiveTool(tool) {
        // Reset all tool states
        isErasing = false;
        isFilling = false;

        // Remove active class from all tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Set the current tool
        currentTool = tool;

        // Add active class to current tool
        switch(tool) {
            case 'pencil':
                pencilBtn.classList.add('active');
                break;
            case 'eraser':
                eraserBtn.classList.add('active');
                isErasing = true;
                break;
            case 'fill':
                fillBtn.classList.add('active');
                isFilling = true;
                break;
        }
    }

    // Event Listeners
    pixelCanvas.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('pixel')) {
            if (isFilling) {
                fill(e.target);
            } else {
                isDrawing = true;
                draw(e.target);
            }
        }
    });

    pixelCanvas.addEventListener('mouseover', function(e) {
        if (isDrawing && e.target.classList.contains('pixel')) {
            draw(e.target);
        }
    });

    document.addEventListener('mouseup', function() {
        isDrawing = false;
    });

    // Color picker
    colorPicker.addEventListener('input', function(e) {
        currentColor = e.target.value;
        updateColorDisplay(currentColor);

        // If using eraser, switch to pencil
        if (isErasing) {
            setActiveTool('pencil');
        }

        // Remove active class from all presets
        colorPresets.forEach(preset => {
            preset.classList.remove('active');
        });
    });

    // Color presets
    colorPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            // Get color from data attribute
            let presetColor = this.getAttribute('data-color');

            // Handle CSS variables
            if (presetColor.startsWith('var(')) {
                // Extract variable name
                const varName = presetColor.match(/var\((.*?)\)/)[1];
                // Get computed value
                presetColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            }

            // Set as current color
            currentColor = presetColor;
            colorPicker.value = presetColor;
            updateColorDisplay(presetColor);

            // If using eraser, switch to pencil
            if (isErasing) {
                setActiveTool('pencil');
            }

            // Remove active class from all presets
            colorPresets.forEach(p => {
                p.classList.remove('active');
            });

            // Add active class to clicked preset
            this.classList.add('active');
        });
    });

    // Tool buttons
    pencilBtn.addEventListener('click', function() {
        setActiveTool('pencil');
    });

    eraserBtn.addEventListener('click', function() {
        setActiveTool('eraser');
    });

    fillBtn.addEventListener('click', function() {
        setActiveTool('fill');
    });

    clearBtn.addEventListener('click', function() {
        if (confirm('确定要清除画布吗？')) {
            const pixels = document.querySelectorAll('.pixel');
            pixels.forEach(pixel => {
                pixel.style.backgroundColor = 'white';
            });
        }
    });

    // Touch support for mobile devices
    pixelCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element && element.classList.contains('pixel')) {
            if (isFilling) {
                fill(element);
            } else {
                isDrawing = true;
                draw(element);
            }
        }
    });

    pixelCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (isDrawing) {
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element && element.classList.contains('pixel')) {
                draw(element);
            }
        }
    });

    pixelCanvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        isDrawing = false;
    });

    // Initialize grid
    createGrid();
});

const monkeySprite = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,2,2,2,3,3,3,3,3,2,2,2,2,2,2,3,3,3,3,1,1,1,0,0,0,0],
    [0,0,1,3,3,3,2,2,2,3,3,3,3,3,3,3,2,2,2,2,3,3,3,3,3,1,3,3,1,0,0,0],
    [0,0,1,3,3,3,2,2,2,3,3,3,1,3,3,3,3,3,3,3,3,3,1,3,3,1,3,3,1,0,0,0],
    [0,0,1,3,3,3,2,2,2,3,3,3,1,3,3,3,3,3,3,3,3,3,1,3,3,1,3,3,1,0,0,0],
    [0,0,0,1,1,1,2,2,2,3,3,3,3,3,3,3,1,1,1,3,3,3,3,3,3,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,5,5,5,5,5,5,5,5,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,1,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,1,2,5,2,3,3,3,3,3,3,3,3,2,5,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,1,2,2,5,3,3,3,3,3,3,3,3,3,3,5,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,1,2,2,5,3,3,3,3,3,3,3,3,3,3,5,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,2,2,5,3,3,3,3,3,3,3,3,3,3,5,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,2,3,3,3,3,3,3,3,3,3,3,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const monkeySpriteMidwalk = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,2,2,2,3,3,3,3,3,2,2,2,2,2,2,3,3,3,3,1,1,1,0,0,0,0],
    [0,0,1,3,3,3,2,2,2,3,3,3,3,3,3,3,2,2,2,2,3,3,3,3,3,1,3,3,1,0,0,0],
    [0,0,1,3,3,3,2,2,2,3,3,3,1,3,3,3,3,3,3,3,3,3,1,3,3,1,3,3,1,0,0,0],
    [0,0,1,3,3,3,2,2,2,3,3,3,1,3,3,3,3,3,3,3,3,3,1,3,3,1,3,3,1,0,0,0],
    [0,0,0,1,1,1,2,2,2,3,3,3,3,3,3,3,1,1,1,3,3,3,3,3,3,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,5,5,5,5,5,5,5,5,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,1,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,1,2,5,2,3,3,3,3,3,3,3,3,2,5,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,1,2,2,5,3,3,3,3,3,3,3,3,3,3,5,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,1,2,2,5,3,3,3,3,3,3,3,3,3,3,5,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,2,2,5,3,3,3,3,3,3,3,3,3,3,5,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,2,3,3,3,3,3,3,3,3,3,3,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,2,2,2,1,1,1,1,1,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function darkenColor(hex, percent) {
    // parse the hex string
    hex = hex.replace(/^#/, '');
    
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    // darken the color
    r = Math.floor(r * (1 - percent / 100));
    g = Math.floor(g * (1 - percent / 100));
    b = Math.floor(b * (1 - percent / 100));

    // ensure the values are within 0-255 range
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    // convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function drawMonkeySprite(ctx, x, y, body_color="#B26B47", direction='right', frame=0) {
    // Define the color palette
    const monkeyColors = [
        'transparent',                  // 0: transparent
        '#000000',                      // 1: black (outline)
        body_color,                     // 2: body color, default = #B26B47
        '#E4B86D',                      // 3: ear/belly color
        'unused',                       // whoops, didnt put 4 lmao
        darkenColor(body_color, 30)     // 5: darker shading (30% darker than body color)
    ];

    const spriteWidth = monkeySprite[0].length;
    let monkey = [monkeySprite, monkeySpriteMidwalk][frame];
    monkey.forEach((row, i) => {
        row.forEach((pixel, j) => {
            if (pixel !== 0) { 
                ctx.fillStyle = monkeyColors[pixel];
                if (direction == 'left') {
                    // If facing left, invert the x-coordinate
                    ctx.fillRect(x + (spriteWidth - 1 - j), y + i, 1, 1);
                } else {
                    ctx.fillRect(x + j, y + i, 1, 1);
                }
            }
        });
    });
}

export { drawMonkeySprite };
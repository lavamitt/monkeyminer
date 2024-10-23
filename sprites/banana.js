const bananaSprite = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,7,8,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,7,8,8,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,6,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,7,6,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,7,7,4,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,4,4,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,4,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,4,4,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,4,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,4,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,4,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,4,4,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,4,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,4,4,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,3,3,3,3,3,3,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,3,3,3,3,3,3,4,4,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,3,3,3,3,3,3,4,4,4,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,3,3,3,4,4,4,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,3,3,3,3,3,3,3,3,3,3,4,4,4,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,4,4,4,3,3,3,3,3,3,3,4,4,4,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,4,4,4,3,3,3,4,4,4,4,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,4,4,4,4,4,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function drawBananaSprite(ctx, x, y) {
    // Define the color palette
    const bananaColors = [
        'transparent',                  // 0: transparent
        '#3E301F',                      // 1: brown (outline)
        '#FBF29D',                      // 2: light yellow highlight
        '#FEDB3C',                      // 3: main yellow body
        '#D6BB42',                      // 4: dark yellow shadow
        '#A8E61D',                      // 5: light green
        '#668224',                      // 6: dark green
        '#E5AA7A',                      // 7: light brown highlight tip
        '#8F4E22'                       // 8: dark brown tip
    ];

    const spriteWidth = bananaSprite[0].length;
    bananaSprite.forEach((row, i) => {
        row.forEach((pixel, j) => {
            if (pixel !== 0) {
                ctx.fillStyle = bananaColors[pixel];
                ctx.fillRect(x + j, y + i, 1, 1);
            }
        });
    });
}

export { drawBananaSprite };
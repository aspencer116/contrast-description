// Convert the rgb values from fractions to numbers between 0 and 255
function getRGB({ r, g, b }) {
    const rgbColorArray = [r, g, b].map(channel => Math.round(channel * 255))
    return rgbColorArray
}

// Convert 6 digit HEX colors into RGB
function HEXtoRGB(HEXcolor) {
    if(HEXcolor.length != 6){
        figma.notify("Plugin Failed: Please enter 6 digit HEX colors")
    }

    var aRgbHex = HEXcolor.match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return aRgb;
}

function calculateLuminance(color) {
    // Use this formula to calculate luminance https://www.w3.org/WAI/GL/wiki/Relative_luminance
    const normalizedColor = color.map(channel => channel / 255)
    const gammaCorrectedRGB = normalizedColor.map(channel =>
        channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4)
    )
    const luminance =
        gammaCorrectedRGB[0] * 0.2126 +
        gammaCorrectedRGB[1] * 0.7152 +
        gammaCorrectedRGB[2] * 0.0722
    return luminance
}

// If a color has opacity, calculate a solid color to use for the contrast calculation
function overlay(foreground, alpha, backgound) {
    const overlaid = foreground.map((channel, i) =>
      Math.round(channel * alpha + backgound[i] * (1 - alpha))
    )
    return overlaid
}

// This is where the ✨ happens
function calculateContrast(foreground, alpha, background) {
    if (alpha < 1) {
        foreground = overlay(foreground, alpha, background)
    }

    const foregroundLuminance = calculateLuminance(foreground) + 0.05
    const backgroundLuminance = calculateLuminance(background) + 0.05
    let contrast = foregroundLuminance / backgroundLuminance

    if (backgroundLuminance > foregroundLuminance) {
        contrast = 1 / contrast
    }

    // round to two decimal places
    contrast = Math.floor(contrast * 100) / 100
    return contrast
}

function getContrastScores(contrast) {
    let score

    switch (true) {
        case contrast > 7:
        score = 'AAA'
        break
        case contrast > 4.5:
        score = 'AA'
        break
        case contrast > 3:
        score = 'AA Large'
        break
        default:
        score = 'FAIL'
        break
    }
    return score
}


// Show the Figma plugin window
figma.showUI(__html__, {height: 500})

// Find all the color styles that currently exist in the file
const styles = figma.getLocalPaintStyles();
let styleNames = [];

// Only send solid color styles that have no transparency since these are the only
// values we can accurately determine color contrast for
for (let i = 0; i < styles.length; i++) {
    let type = styles[i].paints[0].type
    let opacity = styles[i].paints[0].opacity

    if (type === 'SOLID' && opacity === 1 ) {
        styleNames.push(styles[i].name)
    }
}

// Send the color styles to the plugin UI
figma.ui.postMessage({
    type: "render",
    styleNames,
});

// When an array of text color styles are returned...
figma.ui.onmessage = (selectedColors) => {
    let descriptionsAdded = 0;

    // Get just the local styles that are used as text colors
    let textStyles = []

    // Map the color names returned from the plugin UI to color style objects
    for(let i = 0; i < selectedColors.selectedColors.length; i++) {
        for(let x = 0; x < styles.length; x++) {
            if( styles[x].name === selectedColors.selectedColors[i] ) {
                textStyles.push(styles[x])
            }
        }
    }

    let textColors = []
    let backgroundColors = []
    let contrast = []
    let score = []

    // Loop through all the color styles in the file
    for(let i = 0; i < styles.length; i++) {
        // Clear the current color style description
        styles[i].description = `Color contrast unknown`

        // Loop only solid colors with 100% opacity
        if (styles[i].paints[0].type === 'SOLID' && styles[i].paints[0].opacity === 1 ) {
            // Intro line for each description
            let description = `Color contrast with...
`

            for(let x = 0; x < textStyles.length; x++) {
                // Get the RGB values of the text and background color pair
                textColors[x] = getRGB(textStyles[x].paints[0].color)
                backgroundColors[x] = getRGB(styles[i].paints[0].color)

                // Get the color contrast of this color pair
                contrast[x] = calculateContrast(textColors[x], 1, backgroundColors[x])
                score[x] = getContrastScores(contrast[x])

                description += textStyles[x].name + `: ` + score[x] + ` (`+ contrast[x] + `)
`
            }
            styles[i].description = description

            descriptionsAdded++;
        }
    }

    figma.notify("Updated color contrast for " + descriptionsAdded + " color styles! 🎉")

    figma.closePlugin()
}

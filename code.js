let foregroundColor
let foregroundAlpha
let backgroundColorLight
let backgroundColorDark

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
figma.showUI(__html__)

// Send the color styles from the Figma UI
figma.ui.onmessage = (colors) => {
    // Find all the color styles that currently exist in the file
    const styles = figma.getLocalPaintStyles();
    let success = 0;

    // Loop through all the color styles in the file
    for (let i = 0; i < styles.length; i++) {
        // Get the color style type for this color style (solid, gradient, image, etc)
        const type = styles[i].paints[0].type
        const opacity = styles[i].paints[0].opacity

        // Get only the solid color styles
        if (type === 'SOLID' && opacity === 1 ) {
            foregroundColor = getRGB(styles[i].paints[0].color)
            foregroundAlpha = styles[i].paints[0].opacity
            backgroundColorLight = HEXtoRGB(colors.color1)
            backgroundColorDark = HEXtoRGB(colors.color2)

            const contrastWithLight = calculateContrast(foregroundColor, foregroundAlpha, backgroundColorLight)
            const scoresLight = getContrastScores(contrastWithLight)
            const contrastWithDark = calculateContrast(foregroundColor, foregroundAlpha, backgroundColorDark)
            const scoresDark = getContrastScores(contrastWithDark)

            styles[i].description = 
                `Color contrast with...
    ` + colors.color1 + `: ` + scoresLight + ` (`+ contrastWithLight + `)
    ` + colors.color2 + `: ` + scoresDark + ` (` + contrastWithDark + `)`

            success = success + 1;
        }
        else if (opacity < 1) {
            styles[i].description = `Color contrast
Unknown: opacity`
        }
        else {
            styles[i].description = `Color contrast
Unknown: non-solid color`
        }
    }

    figma.notify("Updated color contrast for " + success + " color styles! 🎉")

    figma.closePlugin()
}

// figma.ui.onmessage = (cancel) => {
//     figma.notify("Closed plugin")

//     figma.closePlugin()
// }


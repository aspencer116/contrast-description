let foregroundColor
let foregroundAlpha
let backgroundColor

function getRGB({ r, g, b }) {
    const rgbColorArray = [r, g, b].map(channel => Math.round(channel * 255))
    return rgbColorArray
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

// Find all the color styles that currently exist in the file
const styles = figma.getLocalPaintStyles();

// Loop through all the color styles in the file
for (let i = 0; i < styles.length; i++) {
    // TEST change the description. Delete this later

    // Get the color style type for this color style (solid, gradient, image, etc)
    const type = styles[i].paints[0].type

    // Get only the solid color styles
    if (type === 'SOLID') {
        foregroundColor = getRGB(styles[i].paints[0].color)
        foregroundAlpha = styles[i].paints[0].opacity
        backgroundColor = getRGB({r: 1, g: 1, b: 1})

        const contrast = calculateContrast(foregroundColor, foregroundAlpha, backgroundColor)

        styles[i].description = `Contrast with white: ` + contrast
    }
    else {
        styles[i].description = `Could not determine contrast ratios`
    }
}

figma.closePlugin()

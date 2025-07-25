// Convert the rgb values from fractions to numbers between 0 and 255
function getRGB({ r, g, b }) {
    const rgbColorArray = [r, g, b].map(channel => Math.round(channel * 255));
    return rgbColorArray
}

function getRGBVar(colorVar) {
    const rgbColorArray = [colorVar.r, colorVar.g, colorVar.b].map(channel => Math.round(channel * 255));
    return rgbColorArray
}

// Convert 6 digit HEX colors into RGB
function HEXtoRGB(HEXcolor) {
    if (HEXcolor.length != 6) {
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

// Use this formula to calculate luminance https://www.w3.org/WAI/GL/wiki/Relative_luminance
function calculateLuminance(color) {
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

async function fetchStylesAndVariables() {
    const styles = await figma.getLocalPaintStylesAsync();
    const localVariables = await figma.variables.getLocalVariablesAsync('COLOR');
    const localVariableCollections = await figma.variables.getLocalVariableCollectionsAsync();

    return { styles, localVariables, localVariableCollections };
}

// Main function to process variables and calculate contrast scores
async function main() {
    const { styles, localVariables, localVariableCollections } = await fetchStylesAndVariables();

    let styleNames = [];
    let variableNames = [];

    // Only send solid color styles that have no transparency since these are the only
    // values we can accurately determine color contrast for
    for (let i = 0; i < styles.length; i++) {
        let type = styles[i].paints[0].type;
        let opacity = styles[i].paints[0].opacity;

        if (type === 'SOLID' && opacity === 1) {
            styleNames.push(styles[i].name);
        }
    }

    for (let i = 0; i < localVariables.length; i++) {
        variableNames.push(localVariables[i].name);
    }

    // Send the color styles to the plugin UI
    figma.ui.postMessage({
        type: "render",
        styleNames,
        variableNames,
    });

    // Handle messages from the plugin UI
    figma.ui.onmessage = async (msg) => {
        let descriptionsAdded = 0;
        let varDescriptionsAdded = 0;

        // If color styles are selected, update their descriptions
        if (msg.selectedColors.length > 0) {

            // Get just the local styles that are used as text style colors
            let textStyles = [];

            // Map the color names returned from the plugin UI to color style objects
            for (let i = 0; i < msg.selectedColors.length; i++) {
                for (let x = 0; x < styles.length; x++) {
                    if (styles[x].name === msg.selectedColors[i]) {
                        textStyles.push(styles[x]);
                    }
                }
            }

            let textColors = [];
            let backgroundColors = [];
            let contrast = [];
            let score = [];

            // Loop through all the color styles in the file
            for (let i = 0; i < styles.length; i++) {
                // Clear the current color style description
                if (msg.type === 'replaceDescription') {
                    styles[i].description = `Color contrast unknown`;
                }

                // Loop only solid colors with 100% opacity
                if (styles[i].paints[0].type === 'SOLID' && styles[i].paints[0].opacity === 1) {
                    // Intro line for each description
                    let description = `Color contrast with...
`;

                    for (let x = 0; x < textStyles.length; x++) {
                        // Get the RGB values of the text and background color pair
                        textColors[x] = getRGB(textStyles[x].paints[0].color);
                        backgroundColors[x] = getRGB(styles[i].paints[0].color);

                        // Get the color contrast of this color pair
                        contrast[x] = calculateContrast(textColors[x], 1, backgroundColors[x]);
                        score[x] = getContrastScores(contrast[x]);

                        description += textStyles[x].name + `: ` + score[x] + ` (` + contrast[x] + `)
`;
                    }

                    if (msg.type === 'amendDescription' && styles[i].description !== '') {
                        // Amend existing color descriptions with space between
                        styles[i].description = styles[i].description + `

` + description;
                    } else {
                        // Replace existing color descriptions
                        styles[i].description = description;
                    }

                    descriptionsAdded++;
                }
            }

            // Send a notification to the UI about how many color descriptions were added
            figma.notify("Added color contrast values as a description of " + descriptionsAdded + " color styles! 🎉");
        }

        // If local variables are selected, update their descriptions
        if (msg.selectedVariables.length > 0) {

            // Get just the local variables that are used as text variable colors
            let textVars = [];
            let textVarsName = [];
            let modeId = localVariableCollections[0].modes[0].modeId; // Get the mode ID of the desired mode

            // Map the color names returned from the plugin UI to color style objects
            for (let i = 0; i < msg.selectedVariables.length; i++) {
                for (let x = 0; x < localVariables.length; x++) {
                    if (localVariables[x].name === msg.selectedVariables[i]) {
                        textVars.push(localVariables[x].valuesByMode[modeId]);
                        textVarsName.push(localVariables[x].name);
                    }
                }
            }

            let varContrast = [];
            let varScore = [];

            // Loop through all the color variables in the file
            for (let i = 0; i < localVariables.length; i++) {
                // Intro line for each description
                let varDescription =
                    `Color contrast with...
`;
                for (let x = 0; x < textVars.length; x++) {
                    // Get the RGB values of the text and background color pair
                    let textVarsRGB = getRGBVar(textVars[x]);
                    let backgroundVarsRGB = getRGBVar(localVariables[i].valuesByMode[modeId]);

                    // If the text variable is an alias, get the RGB values of the aliased variable
                    if (textVars[x].type === 'VARIABLE_ALIAS') {
                        const aliasedVariableId = textVars[x].id;
                        let targetVariable = null;

                        for (let x = 0; x < localVariables.length; x++) {
                            if (localVariables[x].id === aliasedVariableId) {
                                targetVariable = localVariables[x];
                            }
                        }

                        if (targetVariable && targetVariable.resolvedType === 'COLOR') {
                            textVarsRGB = getRGBVar(targetVariable.valuesByMode[modeId]);
                        }
                    }

                    // If the background variable is an alias, get the RGB values of the aliased variable
                    if (localVariables[i].valuesByMode[modeId].type === 'VARIABLE_ALIAS') {
                        const aliasedBGVariableId = localVariables[i].valuesByMode[modeId].id;
                        let targetBGVariable = null;

                        for (let x = 0; x < localVariables.length; x++) {
                            if (localVariables[x].id === aliasedBGVariableId) {
                                targetBGVariable = localVariables[x];
                            }
                        }

                        if (targetBGVariable && targetBGVariable.resolvedType === 'COLOR') {
                            backgroundVarsRGB = getRGBVar(targetBGVariable.valuesByMode[modeId]);
                        }
                    }

                    // Calculate color contrast
                    varContrast[x] = calculateContrast(textVarsRGB, 1, backgroundVarsRGB);
                    varScore[x] = getContrastScores(varContrast[x]);

                    varDescription += textVarsName[x] + `: ` + varScore[x] + ` (` + varContrast[x] + `)
`;

                }

                varDescription += `Variable mode: ` + localVariableCollections[0].modes[0].name;

                if (msg.type === 'amendDescription' && localVariables[i].description !== '') {
                    // Amend existing color descriptions with space between
                    localVariables[i].description = localVariables[i].description + `

` + varDescription;
                } else {
                    // Replace existing color descriptions
                    localVariables[i].description = varDescription;
                }

                varDescriptionsAdded++;
            }

            // Send a notification to the UI about how many variable descriptions were added
            figma.notify("Added color contrast values as a description of " + varDescriptionsAdded + " color variables! 🎉");
        }

        figma.closePlugin();
    };
}

// Show the Figma plugin window and start the main function
figma.showUI(__html__, { height: 650 });
main();

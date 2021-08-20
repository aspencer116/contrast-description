// This shows the HTML page in "ui.html".

// figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

figma.showUI(__html__);

const styles = figma.getLocalPaintStyles();
const styleNames = styles.map((style) => style.name);

for (let i = 0; i < styles.length; i++) {
  styles[i].description = `
CONTRAST
🔲 Large AA (4.12)
🔳 Large AA (4.48)`;
}

// Sending a message to ui.html
figma.ui.postMessage({
  type: "render",
  styleNames,
});

// figma.closePlugin();

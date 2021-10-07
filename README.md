# Figma Plugin: Contrast Description

*Note this plugin is a WIP*

![color-contrast](https://user-images.githubusercontent.com/19694054/134062490-1220ef25-cd29-4c9d-9e3a-e99c050517d9.png)

The goal of this plugin is to make it easier to know if your color style pairings pass [WCAG](https://www.w3.org/WAI/WCAG2AAA-Conformance) (Web Content Accessibility Guidelines) color contrast guidelines. It automatically adds information on color contrast to the description of each color style in your project. This helps everyone working on the file to know which color pairs are safe to use by providing contextual information on color contrast directly in the Figma UI.

Here is the plan for building this plugin:
- [x]  Running a plugin adds a generic description to all local color styles
- [x]  Check the color contrast of each color style against #FFFFFF and #000000
- [ ]  Allow the user to input their own values for white and black text to check color contrast
- [ ]  Allow the user to input any number of color values to be added to the description

---

## Setup

Below are the steps to get the plugin running. You can also find instructions at:

https://www.figma.com/plugin-docs/setup/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

https://nodejs.org/en/download/

Next, install TypeScript using the command:

```
npm install -g typescript
```

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

```
npm install --save-dev @figma/plugin-typings
```

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "tsc: watch - tsconfig.json". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.

## About

Hello, I'm Andrew, a product designer at [thoughtbot](https://thoughtbot.com/). I've made it a habit of always recording WCAG color contrast for the colors defined in each project. This helps myself and others remember which colors are accessible with different text colors. This also points out colors that might not be accessible with any text or only with text of a certain size (AA Large).

I'm building this plugin in the open, feel free to follow along!

[Website](https://andrew-spencer.com/) | [Dribbble](https://dribbble.com/iam_aspencer)
